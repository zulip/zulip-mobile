/* @flow strict-local */
import type { ComponentType, ElementConfig } from 'react';
import {
  connect as connectInner,
  useSelector as useSelectorInner,
  useDispatch as useDispatchInner,
} from 'react-redux';

import type { GlobalState, Dispatch, GlobalDispatch } from './types';
import type { BoundedDiff } from './generics';

/* eslint-disable flowtype/generic-spacing */

// We leave this as invariant in `C` (i.e., we don't write `-C` or `+C`)
// because Flow says `ElementConfig` is invariant.  (If you try writing
// `OwnProps<-C, …` or `OwnProps<+C, …`, Flow gives an error saying the `C`
// in `ElementConfig<C>` is an "input/output position", which is a synonym
// of "invariant" as opposed to "contravariant" or "covariant".)
//
// Meanwhile `SP` is contravariant (so we write `-S`): its one occurrence is
// as the second (contravariant) parameter of a `BoundedDiff`, which gets
// used as the first (covariant) parameter of another `BoundedDiff`, which
// is the whole type.  That's an odd number of contravariants, so it's a
// contravariant position / "input position" overall.
//
// As for `-D`: a `+` object property, in the bottom of a BoundedDiff,
// makes a + inside a -, which is again an odd number of - and produces -.
export type OwnProps<C, -SP, -D> = BoundedDiff<
  BoundedDiff<$Exact<ElementConfig<C>>, SP>,
  {| +dispatch: D |},
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
  // TODO(#5006): should be PerAccountState
  mapStateToProps?: (GlobalState, OwnProps<C,
    // Error "property `foo` is missing"?  Add to inner component's props.
    SP, Dispatch>) => SP,
): C => ComponentType<$ReadOnly<OwnProps<C, SP, Dispatch>>> {
  return connectInner(mapStateToProps);
}

export function connectGlobal<SP, P, C: ComponentType<P>>(
  mapStateToProps?: (
    GlobalState,
    OwnProps<
      C,
      // Error "property `foo` is missing"?  Add to inner component's props.
      SP,
      GlobalDispatch,
    >,
  ) => SP,
): C => ComponentType<$ReadOnly<OwnProps<C, SP, GlobalDispatch>>> {
  return connectInner(mapStateToProps);
}

/**
 * Exactly like the `useSelector` in `react-redux` upstream, but more typed.
 *
 * Specifically, this encodes once and for all the type of our Redux state.
 *
 * Without this, if Flow isn't specifically told that the type of `state` is
 * `GlobalState`, it'll infer it as `empty` -- which means the selector
 * function effectively gets no type-checking of anything it does with it.
 */
export function useSelector<SS>(
  selector: (state: GlobalState) => SS,
  equalityFn?: (a: SS, b: SS) => boolean,
): SS {
  return useSelectorInner<GlobalState, SS>(selector, equalityFn);
}

/**
 * Exactly like the `useDispatch` in `react-redux` upstream, but more typed.
 *
 * Specifically, this encodes once and for all the type of our Redux
 * dispatch function.
 *
 * Without this, if Flow isn't told that the return value is of type
 * `Dispatch`, it'll infer it as `empty` -- which means we effectively
 * get no type-checking on the actions we pass to our dispatch
 * function.
 */
export function useDispatch(): Dispatch {
  return useDispatchInner<Dispatch>();
}

export function useGlobalDispatch(): GlobalDispatch {
  return useDispatchInner<GlobalDispatch>();
}
