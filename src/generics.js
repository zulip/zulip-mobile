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
 * An object type with a subset of T's properties, namely those in U.
 *
 * Gives an error unless all properties of U also appear in T.  Each
 * property's type in the result is the type of the same property in T.
 *
 * Handy when T is something like an options object and you want a type
 * representing a subset of the options in T.  Write e.g.
 * `SubsetProperties<T, {| frobMode?: mixed |}>` for an object type that
 * permits only the `frobMode` option, with the exact same type T allows,
 * but without having to repeat the details of that type.
 *
 * A limitation: this implementation can't tell which properties are
 * *optional* in T, i.e. spelled with `?:`, as in `foo?: number`.  Instead,
 * properties in the result will be optional or required based on how they
 * are in U.  To avoid confusion, be sure to make the same properties
 * optional in U as are optional in T.  (In the "options object" use case,
 * typically all the properties are optional.)
 */
// Implementation note: You might think to write this as something like
// $Diff<T, $Diff<T, U>>.  Or $Diff<T, $ObjMap<$Diff<T, U>, () => mixed>>.
// In particular you might hope for this to avoid the limitation mentioned
// above.
//
// Sadly that doesn't work (as of Flow v0.130) when T has any optional
// properties not found in U: the first diff type will still have them
// optional, this will still be true after the $ObjMap, and so the second
// diff won't remove them and they'll all wind up in the resulting type.
//
// Possibly this will get better after a project to fix the handling of
// $Diff and other "type destructors", which as of 2020-08 the Flow team is
// taking up as a priority:
//   https://github.com/facebook/flow/issues/7886#issuecomment-669977952
export type SubsetProperties<T, U> = $ObjMapi<U, <K, V>(K) => $ElementType<T, K>>;

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
