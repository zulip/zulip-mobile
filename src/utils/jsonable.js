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

/**
 * Approximate type of a JSONable value received as input.
 *
 * Unlike the definition of `JSONableDict`, this permits the possibility of
 * `void` elements as dictionary members. This is a workaround for Flow's
 * by-design soundness hole involving indexer elements:
 *
 * ```flow
 *   const obj: { [string]: string } = { a: "a" };
 *   const value: string = obj['b'];
 *   value.trim();  // kaboom!
 * ```
 *
 * ... that is, Flow will assume **all subscript accesses to indexer-property-
 * typed values are valid**, and will not mark values extracted therefrom as
 * potentially undefined. (For references indicating that this is, indeed, by
 * design, see [0] and [1].)
 *
 * Adding `void` as a possible dictionary entry type to JSONable would solve
 * this problem -- but only at the cost of introducing others:
 *   * For output, it is possible to feed a `void`-containing structure to a
 *     serializing function, even though that structure cannot be reversibly
 *     JSON- serialized.
 *   * When processing input, `Object.values` (and related functions) will yield
 *     a type which contains `void`, even though no value in a just-parsed JSON
 *     object can actually be `undefined`.
 *
 * We can mostly avoid these problems by creating a secondary JSONable-like
 * type, `JSONableInput`, used only for validation and transformation of JSON
 * input data.
 *
 * As JSONable <: JSONableInput, but not vice versa, JSON values should
 * generally be passed around as `JSONable` until and unless they're actually
 * being validated; they can then be locally cast to `JSONableInput`.
 *
 * - [0] https://flow.org/en/docs/types/objects/#toc-objects-as-maps
 * - [1] https://github.com/facebook/flow/issues/6568
 */
export type JSONableInput =
  | null
  | string
  | number
  | boolean
  | { +[string]: JSONableInput | void }
  | $ReadOnlyArray<JSONableInput>;

/**
 * Type of a dictionary from JSON input.
 *
 * See documentation of `JSONable` and `JSONableInput` for caveats.
 */
export type JSONableInputDict = { +[string]: JSONableInput | void };
