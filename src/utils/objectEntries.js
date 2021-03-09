/* @flow strict */

/** Ponyfill for properly-typed `Object.entries`. */

// Flow's definition for Object.entries is simply
//    static entries(object: mixed): Array<[string, mixed]>;
// .... which is almost useless.

type EntriesType = <K: string, V>({| +[K]: V |}) => $ReadOnlyArray<[K, V]>;

const objectEntries: EntriesType = obj => (Object.entries(obj): $FlowFixMe);

export default objectEntries;
