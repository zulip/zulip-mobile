/* @flow strict-local */
/**
 * Tools for manipulating generic types in the Flow type system.
 */

/**
 * The type `S`, plus a check that `S` is a supertype of `T`.
 *
 * Gives an error unless `S` is a supertype of `T` -- i.e., a `T` can always
 * be used where an `S` is required.
 *
 * See also `typesEquivalent`, which can be more convenient when not already
 * in the context of a type-level expression.
 */
// Flow would also accept `+S, +T`.  But `+T` is wrong and it's a bug
// that Flow would accept it; see demo_variance_short_circuit in tests.
export type IsSupertype<+S, -T: S> = S; // eslint-disable-line no-unused-vars

/**
 * Gives a type error unless a T can be used as a U and vice versa.
 *
 * In other words this gives an error unless, in the preorder (*) where each
 * type A is a "subtype" of B just if an A can be used as a B, the types T
 * and U are equivalent.
 *
 * Handy when testing or debugging complex type expressions, to check that
 * they come out to something equivalent to what you think they are.
 *
 * When two types are equivalent (and neither one involves an "unclear" type
 * like `any`), they are interchangeable for any direct uses.
 *
 * Examples:
 *
 *   // These are two ways of spelling the same type.
 *   typesEquivalent<$ReadOnly<{| x: number |}>, {| +x: number |}>();
 *
 *   // FlowExpectedError - These are different types :-)
 *   typesEquivalent<number, number | void>(); // error
 *
 * Important caveat #1: When T or U is an "unclear type", i.e. one involving
 *   `any` or its less-common friends `Object` or `Function`, this can give
 *   misleading results.  In particular, `any` will be reported as
 *   "equivalent" to *whatever* type you try, even types that are not
 *   equivalent to each other.
 *
 *   This is because the subtype relation is only a preorder (*) when
 *   unclear types are excluded.  The meaning of `any` is that any A can be
 *   used as `any`, and `any` as any B, even when A can't be used as B; and
 *   that makes the relation not transitive.  The "equivalent" terminology
 *   really only makes sense in the context of a preorder.
 *
 *   Not 100% sure the subtype relation is entirely a preorder even without
 *   `any` and friends -- Flow is unfortunately not well documented at this
 *   conceptual level.
 *
 * Important caveat #2: Sometimes complex type operations like $Diff can
 *   take types that are equivalent in this sense and produce inequivalent
 *   results.  The only known examples of this involve types that probably
 *   shouldn't be equivalent in the first place, namely object types where
 *   the same property is optional on the one hand and required on the
 *   other.  See test `test_typesEquivalent_$Diff_surprise`.
 *
 * (*) "Preorder" means the relation is reflexive (A subtype A, for all A)
 *   and transitive (whenever A subtype B subtype C, then also A subtype C.)
 *
 * See also `IsSupertype`, which is suitable to use directly in type-level
 * expressions.
 */
// eslint-disable-next-line no-unused-vars
export function typesEquivalent<T, U: T, _InternalDoNotPass: U = T>() {}
// Another formulation that's believed to give the same results:
//   (x: T): U => x;
//   (x: U): T => x;
// Those together should be accepted exactly when typesEquivalent<T, U>() is.

/**
 * An inverse of the operation `(A, B) => {| ...A, ...B |}`, with checking.
 *
 * Similar to `$Diff`, but checks that the subtraction makes sense.
 * Also always subtracts a given property completely, even if its type on
 * `L` happens to be more specific than on `U`.
 *
 * Assumes both `U` and `L` are exact, read-only, object types.  (If not,
 * behavior unknown.)  Returns a solution `D`, where possible, to the type
 * equation
 *   `U == {| ...D, ...L |}`
 * with an (exact, read-only) object type `D`.
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
// Flow would also accept `-U` or `+L` or any combination.  But either of
// those is wrong and Flow shouldn't accept them, for the same reasons as
// around `IsSupertype`; see demo_variance_short_circuit in tests.
//
// This version `+U, -L` probably also shouldn't be accepted by Flow, given
// that we haven't explained to it our requirement that U and L be exact,
// read-only object types.  But given that assumption, if one considers
// type expressions BoundedDiff<U1, L1> and BoundedDiff<U2, L2> with
// U1 <: U2 and on the other hand L2 <: L1, then working through each of the
// points listed at the end of the jsdoc, one can see that if
// BoundedDiff<U1, L1> is valid then so is BoundedDiff<U2, L2>, and the
// former can appropriately flow to the latter.
export type BoundedDiff<+U, -L> =
  // The $ReadOnly is to work around a Flow bug that `$Diff` loses variance:
  //   https://github.com/facebook/flow/issues/6225
  // (If we wanted to use BoundedDiff with non-read-only `U`, this
  // workaround wouldn't work; but happily we don't.)
  $ReadOnly<
    $Diff<
      // This `IsSupertype` is the part that checks that all of L's properties
      // (a) are present on U and (b) have appropriate types to use on U.
      IsSupertype<U, $ReadOnly<{| ...U, ...L |}>>,
      // This `$ObjMap` makes a variant of `L` that `$Diff` treats as more
      // powerful, ensuring that all properties in `L` are removed completely.
      $ObjMap<L, () => mixed>,
    >,
  >;

/**
 * The object type `T` with its readonly annotation stripped.
 */
// The implementation relies on facebook/flow#6225, so it will
// naturally have to change when that gets fixed.
//
// See discussion for an alternative, with `$ObjMap`, that seemed like
// it was going to work, but didn't:
//   https://github.com/zulip/zulip-mobile/pull/4520#discussion_r593394451.
//
// TODO test this, so we notice when the Flow bug is fixed and breaks it.
export type ReadWrite<T: $ReadOnly<{ ... }>> = $Diff<T, {||}>;

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
