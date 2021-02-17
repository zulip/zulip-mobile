/* @flow strict-local */
import AsyncStorage from '@react-native-community/async-storage';
import { NativeModules } from 'react-native';
import * as logging from '../utils/logging';

export default class ZulipAsyncStorage {
  static async getItem(key: string, callback: (error: ?Error, result: ?string) => void) {
    let result = await AsyncStorage.getItem(key);
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
    if (result !== null && result.startsWith('z')) {
      const header = result.substring(0, result.indexOf('|', result.indexOf('|') + 1) + 1);
      if (
        NativeModules.TextCompressionModule
        && header === NativeModules.TextCompressionModule.header
      ) {
        result = await NativeModules.TextCompressionModule.decompress(result);
      } else {
        // Panic! If we are confronted with an unknown format, there is
        // nothing we can do to save the situation. Log an error and ignore
        // the data.  This error should not happen unless a user downgrades
        // their version of the app.
        const err = new Error(`No decompression module found for format ${header}`);
        logging.error(err);
        if (callback) {
          callback(err, null);
        }
        throw err;
      }
    }
    if (callback) {
      callback(undefined, result);
    }
    return result;
  }

  static async setItem(key: string, value: string, callback: ?(error: ?Error) => void) {
    if (!NativeModules.TextCompressionModule) {
      return AsyncStorage.setItem(key, value, callback);
    }
    return AsyncStorage.setItem(
      key,
      await NativeModules.TextCompressionModule.compress(value),
      callback,
    );
  }

  static removeItem = AsyncStorage.removeItem;

  static getAllKeys = AsyncStorage.getAllKeys;

  static clear = AsyncStorage.clear;
}
