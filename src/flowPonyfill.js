/**
 * Ponyfills for better-typed versions of functions than the Flow stdlib.
 *
 * FlowIssue: Everything here should really become a fix upstream in
 * flowlib.
 *
 * @flow strict
 */

/**
 * Ponyfill for properly-typed `Object.entries`.
 *
 * See also `objectValues`, for `Object.values`.
 */
export function objectEntries<K: string, V>(obj: {| +[K]: V |}): Array<[K, V]> {
  // Flow's definition for Object.entries is simply
  //    static entries(object: mixed): Array<[string, mixed]>;
  // .... which is almost useless.
  return (Object.entries(obj): $FlowIssue);
}

/**
 * Ponyfill for properly-typed `Object.values`.
 *
 * See also `objectEntries`, for `Object.entries`.
 */
export function objectValues<K: string, V>(obj: {| +[K]: V |}): V[] {
  return (Object.values(obj): $FlowIssue); // Really should be fixed in flowlib.
}
