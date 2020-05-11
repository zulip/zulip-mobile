/* @flow strict-local */
import type { ComponentType, ElementConfig } from 'react';
import { connect as connectInner } from 'react-redux';

import type { GlobalState, Dispatch } from './types';

/* eslint-disable flowtype/generic-spacing */

/**
 * The type `S`, plus a check that `S` is a supertype of `T`.
 *
 * Gives an error unless `S` is a supertype of `T` -- i.e., a `T` can always
 * be used where an `S` is required.
 */
type IsSupertype<+S, +T: S> = S; // eslint-disable-line no-unused-vars

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

export type OwnProps<-C, -SP> = $Diff<
  BoundedDiff<$Exact<ElementConfig<C>>, SP>,
  {| dispatch: Dispatch |},
>;

/**
 * Exactly like the `connect` in `react-redux` upstream, but more typed.
 *
 * NOTE:
 *  * This version works great with a `mapStateToProps` that takes only
 *    the state and not the outer props.
 *
 *  * For two-argument `mapStateToProps`, Flow needs a little help: write
 *
 *        connect<SelectorProps, _, _>((state, props) => …)(MyComponent)
 *
 *    where `SelectorProps` describes the return value of `mapStateToProps`.
 *    This type will get fully checked; Flow just can't infer it.
 *    See our commit fcde7005e, and previous discussion at f8c981028.
 *
 *  * For no-argument `connect`, Flow also needs help: write
 *
 *        connect<{||}, _, _>()(MyComponent)
 *
 *    Awkwardly, in this case Flow will actually infer the wrong thing if
 *    the explicit `{||}` is omitted, and fail to catch errors.  See our
 *    commit 1e0006e5b.
 *    TODO: fix this, perhaps with an overload.
 *
 * The upstream function, and its libdef in `flow-typed`, has an extremely
 * complex type involving many overloads, and it's difficult to get useful
 * results with it from the type-checker.  This trivial wrapper leaves out a
 * bunch of features we don't use, and then gives a more specific type.
 *
 * This version also takes advantage of being in our codebase, rather than a
 * general libdef, by encoding once and for all the type of our Redux state.
 *
 * (Most of those features probably *could* be supported with a more-helpful
 * type like this if desired, just with a moderate amount of further work.
 * Finding this type was a lot of work, and the extra features were left out
 * for the sake of focus while iterating on that.)
 */
// prettier-ignore
export function connect<SP, P, C: ComponentType<P>>(
  mapStateToProps?: (GlobalState, OwnProps<C,
    // Error "property `foo` is missing"?  Add to inner component's props.
    SP>) => SP,
): C => ComponentType<$ReadOnly<OwnProps<C, SP>>> {
  return connectInner(mapStateToProps);
}
