/* @flow strict */
/* eslint-disable flowtype/type-id-match */

/**
 * Type of a round-trip-capable JSONable object.
 *
 * Note that this is not the same as the type of objects which `JSON.stringify`
 * will accept, nor even the type of objects which `JSON.stringify` will accept
 * without returning `undefined`. For example,
 *
 *    JSON.stringify({f: 2, g: () => 3, h: undefined}) === '{"f":2}'
 *
 * which of course will not be equal to the original object after parsing.
 */
export type JSONable =
  | null
  | string
  | number
  | boolean
  | { +[string]: JSONable } // [α]
  | $ReadOnlyArray<JSONable>;
// [α] This should just be `JSONableDict`, but Flow doesn't handle
//     mutually-recursive types very well.

/**
 * Type of a round-trip-capable JSONable dictionary.
 *
 * See documentation of `JSONable` for caveats.
 */
export type JSONableDict = { +[string]: JSONable };
// This should really be an exact type, `{| +[string]: JSONable |}`.
// Unfortunately, it can't yet be.
//
// Prior to Flow v0.111.0 (i.e., prior to React Native v0.62.0), exact object
// types with indexer properties are unusably broken. The following trivial
// example fails to typecheck:
//
//    const val: {| [string]: number |} = { foo: 3 };
//
// On the other hand, inexact indexer-property types don't actually have their
// properties typechecked at their point of use -- that is, the following passes
// typechecking (even after v0.111.0):
//
//    const val: { [string]: number } = { foo: 3, bar: 'baz' };
//
// ... which is consistent with the definition of inexact types, if
// inconvenient.
