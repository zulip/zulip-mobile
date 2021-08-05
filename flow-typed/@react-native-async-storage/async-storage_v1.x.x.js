// All definitions taken directly from:
//    @react-native-async-storage/async-storage/lib/AsyncStorage.js

declare module '@react-native-async-storage/async-storage' {
  declare type ReadOnlyArrayString = $ReadOnlyArray<string>;

  declare export default {
    getItem(
      key: string,
      callback?: ?(error: ?Error, result: string | null) => void,
    ): Promise<string | null>,

    setItem(key: string, value: string, callback?: ?(error: ?Error) => void): Promise<mixed>,

    multiSet(
      keyValuePairs: Array<Array<string>>,
      callback?: ?(errors: ?$ReadOnlyArray<?Error>) => void,
    ): Promise<mixed>,

    removeItem(key: string, callback?: ?(error: ?Error) => void): Promise<mixed>,

    getAllKeys(
      callback?: ?(error: ?Error, keys: ?ReadOnlyArrayString) => void,
    ): Promise<ReadOnlyArrayString>,

    clear(callback?: ?(error: ?Error) => void): Promise<mixed>,

    ...
  };
}
