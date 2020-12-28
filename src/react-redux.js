/* @flow strict-local */
import type { ComponentType, ElementConfig } from 'react';
import { connect as connectInner } from 'react-redux';

import type { GlobalState, Dispatch } from './types';
import type { BoundedDiff } from './generics';

/* eslint-disable flowtype/generic-spacing */

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
