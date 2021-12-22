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
import { type SQLTransaction } from './sqlite';

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

async function decode(item: string): Promise<string> {
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
  if (item.startsWith('z')) {
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

type CompressedMigrationCallback = (
  SQLTransaction,
  { encode: string => Promise<string>, decode: string => Promise<string> },
) => Promise<void>;

export class CompressedMigration {
  startVersion: number;
  endVersion: number;
  migrate: CompressedMigrationCallback;

  constructor(startVersion: number, endVersion: number, migrate: CompressedMigrationCallback) {
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

class CompressedAsyncStorageImpl {
  storage: BaseAsyncStorage;

  constructor(version: number, migrations: $ReadOnlyArray<Migration | CompressedMigration>) {
    this.storage = new BaseAsyncStorage(
      version,
      migrations.map(m => (m instanceof CompressedMigration ? m.asPlainMigration() : m)),
    );
  }

  async getItem(key: string): Promise<string | null> {
    const value = await this.storage.getItem(key);
    return value == null ? value : decode(value);
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
