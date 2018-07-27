/* @flow */
import { AsyncStorage, NativeModules } from 'react-native';
import { logErrorRemotely } from '../utils/logging';

export default class ZulipAsyncStorage {
  static async getItem(key: string, callback: (error: ?Error, result: ?string) => void) {
    let result = await AsyncStorage.getItem(key);
    // It's possible that getItem() is called on uncompressed state, for
    // example when a user updates their app from a version without
    // compression to a version with compression. Detect if the stored state
    // is compressed, and return it unmodified if it isn't. Detect
    // compressed states by inspecting the first few characters of `result`.
    // A 'z' indicates a "Zulip"-compressed string. Otherwise, treat the
    // string as uncompressed JSON (luckily, valid JSON never starts with a
    // 'z'). If `result` starts with 'z', `result` looks like
    // `z|TRANSFORMS|DATA`, where
    // TRANSFORMS = space-separated sequence of transformations that we
    //   applied to DATA in the order they are listed and now need to undo
    //   (e.g. "zlib base64")
    // DATA = state in JSON format with TRANSFORMS applied
    // The "z|TRANSFORMS|" part shall be called the "header" of the string.
    if (result.startsWith('z')) {
      const header = result.substring(0, result.indexOf('|', result.indexOf('|') + 1) + 1);
      if (
        NativeModules.TextCompressionModule !== undefined
        && header === NativeModules.TextCompressionModule.header
      ) {
        result = await NativeModules.TextCompressionModule.decompress(result);
      } else {
        // Panic! If we are confronted with an unknown format, there is
        // nothing we can do to save the situation. Log an error and ignore
        // the data.  This error should not happen unless a user downgrades
        // their version of the app.
        const err = new Error(`No decompression module found for format ${header}`);
        logErrorRemotely(err, '');
        callback(err, null);
        throw err;
      }
    }
    callback(undefined, result);
    return result;
  }

  static async setItem(key: string, value: string, callback: ?(error: ?Error) => void) {
    if (NativeModules.TextCompressionModule === undefined) {
      return AsyncStorage.setItem(key, value, callback);
    }
    return AsyncStorage.setItem(
      key,
      await NativeModules.TextCompressionModule.compress(value),
      callback,
    );
  }

  static getAllKeys = AsyncStorage.getAllKeys;

  static clear = AsyncStorage.clear;
}
