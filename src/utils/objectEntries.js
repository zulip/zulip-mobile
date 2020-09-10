/* @flow strict */

/** Ponyfill for properly-typed `Object.entries`. */

// Flow's definition for Object.entries is simply
//    static entries(object: mixed): Array<[string, mixed]>;
// .... which is almost useless.

type EntriesType = <K: string, V>({ +[K]: V }) => $ReadOnlyArray<[K, V]>;

const objectEntries: EntriesType = obj => (Object.entries(obj): $FlowFixMe);

export default objectEntries;

/*
 * Note that the above definition is formally unsound. In particular,
 *
 * ```
 *   const obj: { 'foo': string } = { foo: "yes", bar: 2 };
 *   const vals: string[] = entries(obj).map(s => s[1]);
 *   const valsPadded: string[] = vals.map(v => v.padStart(5));
 * ```
 *
 * ... will pass typechecking, but fail at runtime.
 *
 * To make this function sound, it is necessary that the input type be an
 * _exact_ type. However, the primary use case for this function is map-objects
 * declared with indexer properties; and, until Flow v0.126.0, exact types with
 * indexer properties are unusable. (See comments in ./jsonable.js for more
 * information.)
 */
