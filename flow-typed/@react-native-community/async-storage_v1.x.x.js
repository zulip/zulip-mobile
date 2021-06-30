// All definitions taken directly from:
//    @react-native-community/async-storage/lib/AsyncStorage.js

declare module '@react-native-community/async-storage' {
  declare type ReadOnlyArrayString = $ReadOnlyArray<string>;

  declare export default {
    getItem(
      key: string,
      callback?: ?(error: ?Error, result: string | null) => void,
    ): Promise<string | null>,

    setItem(key: string, value: string, callback?: ?(error: ?Error) => void): Promise<null>,

    removeItem(key: string, callback?: ?(error: ?Error) => void): Promise<null>,

    getAllKeys(
      callback?: ?(error: ?Error, keys: ?ReadOnlyArrayString) => void,
    ): Promise<ReadOnlyArrayString>,

    clear(callback?: ?(error: ?Error) => void): Promise<null>,

    ...
  };
}
