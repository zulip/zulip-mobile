/* @flow strict-local */
import invariant from 'invariant';
import { NativeModules } from 'react-native';

import { AsyncStorage } from './AsyncStorage';
import * as logging from '../utils/logging';

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

export default class CompressedAsyncStorage {
  static async getItem(key: string): Promise<string | null> {
    const item = await AsyncStorage.getItem(key);

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
        // TODO: It'd be real nice to handle this decompression on the
        //   native side within getItem, so that we pass the data one way
        //   native->JS instead of three ways native->JS->native->JS.
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

  /** (The value must be a result of `JSON.stringify`.) */
  // The invariant that the value is JSON is relied on by `getItem`, to
  // guarantee that our compression header can't appear in uncompressed data.
  static async setItem(key: string, value: string): Promise<mixed> {
    if (NODE_ENV !== 'production') {
      assertPlausiblyJSONEncoded(value);
    }

    return AsyncStorage.setItem(
      key,
      NativeModules.TextCompressionModule
        ? await NativeModules.TextCompressionModule.compress(value)
        : value,
    );
  }

  /** (Each value must be a result of `JSON.stringify`.) */
  // The invariant that the value is JSON is relied on by `getItem`, to
  // guarantee that our compression header can't appear in uncompressed data.
  static async multiSet(keyValuePairs: Array<Array<string>>): Promise<mixed> {
    if (NODE_ENV !== 'production') {
      // eslint-disable-next-line no-unused-vars
      for (const [_, value] of keyValuePairs) {
        assertPlausiblyJSONEncoded(value);
      }
    }

    return AsyncStorage.multiSet(
      NativeModules.TextCompressionModule
        ? await Promise.all(
            keyValuePairs.map(async ([key, value]) => [
              key,
              // TODO: It'd be real nice to handle this compression on the
              //   native side within multiSet, so that we pass the data one
              //   way JS->native instead of three ways JS->native->JS->native.
              await NativeModules.TextCompressionModule.compress(value),
            ]),
          )
        : keyValuePairs,
    );
  }

  static removeItem: typeof AsyncStorage.removeItem = key => AsyncStorage.removeItem(key);

  static getAllKeys: typeof AsyncStorage.getAllKeys = () => AsyncStorage.getAllKeys();

  static clear: typeof AsyncStorage.clear = () => AsyncStorage.clear();
}
