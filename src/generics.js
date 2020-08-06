/* @flow strict-local */
/**
 * Tools for manipulating generic types in the Flow type system.
 */

/* eslint-disable flowtype/generic-spacing */

/**
 * The type `S`, plus a check that `S` is a supertype of `T`.
 *
 * Gives an error unless `S` is a supertype of `T` -- i.e., a `T` can always
 * be used where an `S` is required.
 */
export type IsSupertype<+S, +T: S> = S; // eslint-disable-line no-unused-vars

/**
 * An inverse of the operation `(A, B) => {| ...A, ...B |}`, with checking.
 *
 * Similar to `$Diff`, but checks that the subtraction makes sense.
 * Also always subtracts a given property completely, even if its type on
 * `L` happens to be more specific than on `U`.
 *
 * Assumes both U and L are exact object types.  (If not, behavior unknown.)
 * Returns a solution, where possible, to the type equation
 *   `U == {| ...D, ...L |}`
 * with an (inexact) object type `D`.
 *
 * More generally, returns the most general solution `D` to the relation
 *   `{| ...D, ...L |}: U`  (read "subtype of")
 * I.e., the most general type `D` such that `{| ...D, ...L |}` can be used
 * where a `U` is expected.  If there is no such `D`, causes a type error.
 *
 * In particular, this means:
 *  * Error if `L` has any extra properties that aren't in `U`.
 *  * Error unless each property of `L` has the same type as in `U`, or a subtype
 *    (i.e., the property's values in `L` are valid for `U`).
 *  * `D` has exactly the properties in `U` that aren't in `L`.
 *  * Each property of `D` has the same type as in `U`.
 */
// Oddly, Flow accepts this declaration with <-U, -L> but also with <+U, +L>.
export type BoundedDiff<-U, -L> = $Diff<
  // This `IsSupertype` is the part that checks that all of L's properties
  // (a) are present on U and (b) have appropriate types to use on U.
  IsSupertype<U, $ReadOnly<{| ...U, ...L |}>>,
  // This `$ObjMap` makes a variant of `L` that `$Diff` treats as more
  // powerful, ensuring that all properties in `L` are removed completely.
  $ObjMap<L, () => mixed>,
>;

/**
 * Assert a contradiction, statically.  Do nothing at runtime.
 *
 * The `empty` type is the type with no values.  So, apart from certain bugs
 * in Flow, the only way a call to this function can ever be valid is when
 * the type-checker can actually prove the call site is unreachable.
 *
 * Especially useful for statically asserting that a `switch` statement is
 * exhaustive:
 *
 *     type Foo =
 *       | {| type: 'frob', ... |}
 *       | {| type: 'twiddle', ... |};
 *
 *
 *     const foo: Foo = ...;
 *     switch (foo.type) {
 *       case 'frob': ...; break;
 *
 *       case 'twiddle': ...; break;
 *
 *       default:
 *         ensureUnreachable(foo); // Asserts no possible cases for `foo` remain.
 *         break;
 *     }
 *
 * In this example if by mistake a case is omitted, or if another case is
 * added to the type without a corresponding `case` statement here, then
 * Flow will report a type error at the `ensureUnreachable` call.
 */
export function ensureUnreachable(x: empty) {}
