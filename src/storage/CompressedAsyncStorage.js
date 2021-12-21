/* @flow strict-local */
import invariant from 'invariant';
import { NativeModules } from 'react-native';

import {
  AsyncStorage,
  BaseAsyncStorage,
  migrationFromLegacyAsyncStorage,
  Migration,
} from './AsyncStorage';
import * as logging from '../utils/logging';
import { SQLDatabase } from './sqlite';
import getStoredState from '../third/redux-persist/getStoredState';

const NODE_ENV = process.env.NODE_ENV;

/** Assert the given string is plausibly the JSON encoding of some value. */
function assertPlausiblyJSONEncoded(value: string) {
  // To keep it quick, just look at the first character.  This should be
  // enough to catch bugs that are just sending arbitrary strings.
  //
  // Every JSON value is either null, true, false,
  // or a number, string, array, or object.
  invariant(/^[ntf\-0-9"[{]/.test(value), 'value must be JSON-encoded');
}

async function decode(item: string | null): Promise<string | null> {
  // It's possible that getItem() is called on uncompressed state, for
  // example when a user updates their app from a version without
  // compression to a version with compression.  So we need to detect that.
  //
  // We can detect compressed states by inspecting the first few
  // characters of `result`.  First, a leading 'z' indicates a
  // "Zulip"-compressed string; otherwise, the string is the only other
  // format we've ever stored, namely uncompressed JSON (which,
  // conveniently, never starts with a 'z').
  //
  // Then, a Zulip-compressed string looks like `z|TRANSFORMS|DATA`, where
  // TRANSFORMS is a space-separated list of the transformations that we
  // applied, in order, to the data to produce DATA and now need to undo.
  // E.g., `zlib base64` means DATA is a base64 encoding of a zlib
  // encoding of the underlying data.  We call the "z|TRANSFORMS|" part
  // the "header" of the string.
  if (item !== null && item.startsWith('z')) {
    // In this block, `item` is compressed state.
    const header = item.substring(0, item.indexOf('|', item.indexOf('|') + 1) + 1);
    if (
      NativeModules.TextCompressionModule
      && header === NativeModules.TextCompressionModule.header
    ) {
      // TODO: It'd be real nice to do this decompression on the native
      //   side, so that we pass the data one way native->JS instead of
      //   three ways native->JS->native->JS.
      return NativeModules.TextCompressionModule.decompress(item);
    } else {
      // Panic! If we are confronted with an unknown format, there is
      // nothing we can do to save the situation. Log an error and ignore
      // the data.  This error should not happen unless a user downgrades
      // their version of the app.
      const err = new Error(`No decompression module found for format ${header}`);
      logging.error(err);
      throw err;
    }
  }

  // Uncompressed state
  return item;
}

async function encode(value: string): Promise<string> {
  if (NODE_ENV !== 'production') {
    assertPlausiblyJSONEncoded(value);
  }

  return NativeModules.TextCompressionModule
    ? NativeModules.TextCompressionModule.compress(value)
    : value;
}

async function encodeValues(keyValuePairs: string[][]): Promise<string[][]> {
  if (NODE_ENV !== 'production') {
    // eslint-disable-next-line no-unused-vars
    for (const [_, value] of keyValuePairs) {
      assertPlausiblyJSONEncoded(value);
    }
  }

  return NativeModules.TextCompressionModule
    ? Promise.all(
        keyValuePairs.map(async ([key, value]) => [
          key,
          // TODO: It'd be real nice to do this compression on the native
          //   side, so that we pass the data one way native->JS instead of
          //   three ways native->JS->native->JS.
          await NativeModules.TextCompressionModule.compress(value),
        ]),
      )
    : keyValuePairs;
}

export class CompressedMigration {
  startVersion: number;
  endVersion: number;
  migrate: (
    SQLDatabase,
    { encode: string => Promise<string>, decode: string | (null => Promise<string | null>) },
  ) => Promise<void>;

  constructor(startVersion: number, endVersion: number, migrate: SQLDatabase => Promise<void>) {
    invariant(
      startVersion + 1 === endVersion,
      'AsyncStorage migration only supports incrementing version by 1',
    );
    this.startVersion = startVersion;
    this.endVersion = endVersion;
    this.migrate = migrate;
  }

  asPlainMigration(): Migration {
    return new Migration(this.startVersion, this.endVersion, db =>
      this.migrate(db, { encode, decode }),
    );
  }
}

export class StateMigration {
  startVersion: number;
  endVersion: number;
  migrate: mixed => mixed;

  asPlainMigration(): Migration {
    return new Migration(this.startVersion, this.endVersion, async db => {
      // TODO kind of ugly to re-create a db cxn when we were just passed one
      const storage = new CompressedAsyncStorageImpl(this.startVersion, []);
      // TODO needs serialize/deserialize
      const state = getStoredState({ storage });
      const newState = this.migrate(state);
      // TODO somehow get at createPersistor#writeOnce
      //   ... hmm.  In the existing migrations, we're actually using the
      //   reducers where they act on a REHYDRATE action, in order to merge
      //   initial values for new fields.  So we'll need that too; or,
      //   maybe fold those into the existing-style migrations code.
      //
      //   Hmm also: there seems to be a latent(?) bug in that: if for some
      //   subtree we had stored an object that's just the initial values,
      //   but a subset of the current initial values, then we won't
      //   immediately go and store the new value for that subtree, because
      //   rehydrate won't have changed the in-process value.  Really the
      //   problem there is that we're comparing new vs. previous in-process
      //   value, and that for REHYDRATE that means merged vs. initial,
      //   whereas what's relevant is merged vs. previously-stored.

      // I kind of want to only ever write one of these, to wrap all the
      // old-style migrations.  So it might be a bit messy-looking but
      // that's fine.  (And should probably be just an instance of
      // CompressedMigration, not a class.)
      //
      // Then write new migrations like CompressedMigration or plain
      // Migration: they identify the keys they care about, and either just
      // UPDATE the keys themselves (to move things around) or SELECT them,
      // decode, shuffle/munge data as needed, encode, then INSERT / DELETE.
    });
  }
}

class CompressedAsyncStorageImpl {
  storage: BaseAsyncStorage;

  constructor(version: number, migrations: $ReadOnlyArray<Migration | CompressedMigration>) {
    this.storage = new BaseAsyncStorage(
      version,
      migrations.map(m => (m instanceof CompressedMigration ? m.asPlainMigration() : m)),
    );
  }

  async getItem(key: string): Promise<string | null> {
    return decode(await this.storage.getItem(key));
  }

  /** (The value must be a result of `JSON.stringify`.) */
  // The invariant that the value is JSON is relied on by `getItem`, to
  // guarantee that our compression header can't appear in uncompressed data.
  async setItem(key: string, value: string): Promise<mixed> {
    return this.storage.setItem(key, await encode(value));
  }

  /** (Each value must be a result of `JSON.stringify`.) */
  // The invariant that the value is JSON is relied on by `getItem`, to
  // guarantee that our compression header can't appear in uncompressed data.
  async multiSet(keyValuePairs: Array<Array<string>>): Promise<mixed> {
    return this.storage.multiSet(await encodeValues(keyValuePairs));
  }

  removeItem: typeof AsyncStorage.removeItem = key => this.storage.removeItem(key);

  getAllKeys: typeof AsyncStorage.getAllKeys = () => this.storage.getAllKeys();

  clear: typeof AsyncStorage.clear = () => this.storage.clear();
}

export default (new CompressedAsyncStorageImpl(1, [
  migrationFromLegacyAsyncStorage,
]): CompressedAsyncStorageImpl);
