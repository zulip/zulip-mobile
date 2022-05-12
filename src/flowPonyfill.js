/**
 * Ponyfills for better-typed versions of functions than the Flow stdlib.
 *
 * FlowIssue: Everything here should really become a fix upstream in
 * flowlib.
 *
 * @flow strict
 */

/** Ponyfill for properly-typed `Object.entries`. */
export const objectEntries = <K: string, V>(obj: {| +[K]: V |}): Array<[K, V]> =>
  // Flow's definition for Object.entries is simply
  //    static entries(object: mixed): Array<[string, mixed]>;
  // .... which is almost useless.
  (Object.entries(obj): $FlowFixMe);
