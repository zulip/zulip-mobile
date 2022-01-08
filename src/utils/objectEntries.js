/* @flow strict */

/** Ponyfill for properly-typed `Object.entries`. */

// Flow's definition for Object.entries is simply
//    static entries(object: mixed): Array<[string, mixed]>;
// .... which is almost useless.

const objectEntries = <K: string, V>(obj: {| +[K]: V |}): Array<[K, V]> =>
  (Object.entries(obj): $FlowFixMe);

export default objectEntries;
