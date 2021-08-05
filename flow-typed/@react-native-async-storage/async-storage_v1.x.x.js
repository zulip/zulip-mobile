// All definitions taken directly from:
//    @react-native-async-storage/async-storage/lib/AsyncStorage.js

declare module '@react-native-async-storage/async-storage' {
  declare type ReadOnlyArrayString = $ReadOnlyArray<string>;

  declare export default class AsyncStorage {
    static getItem(
      key: string,
      callback?: ?(error: ?Error, result: string | null) => void,
    ): Promise<string | null>,

    static setItem(key: string, value: string, callback?: ?(error: ?Error) => void): Promise<mixed>,

    static multiSet(
      keyValuePairs: Array<Array<string>>,
      callback?: ?(errors: ?$ReadOnlyArray<?Error>) => void,
    ): Promise<mixed>,

    static removeItem(key: string, callback?: ?(error: ?Error) => void): Promise<mixed>,

    static getAllKeys(
      callback?: ?(error: ?Error, keys: ?ReadOnlyArrayString) => void,
    ): Promise<ReadOnlyArrayString>,

    static clear(callback?: ?(error: ?Error) => void): Promise<mixed>,
  }
}
