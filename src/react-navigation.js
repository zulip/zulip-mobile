/**
 * Helpers for using react-navigation and its relatives.
 *
 * @flow strict-local
 */

import { type ElementConfig } from 'react';
import { useNavigation as useNavigationInner, type Route } from '@react-navigation/native';

import type { AppNavigationMethods } from './nav/AppNavigator';

/**
 * A type to use for the `route` prop on a screen component.
 *
 * Typically used in the component definition, to annotate its `route` prop.
 *
 * The type this produces is just like the one produced by `RouteProp` in
 * the upstream libdef.  The difference is that this one takes `RouteParams`
 * as an argument directly, making it suitable for expressing the params
 * type directly in the component's own source, just like props types.  The
 * navigator's central param list can then use `RouteParamsOf` to get the
 * appropriate type from the component definition, rather than vice versa.
 *
 * @param {RouteName} - Must equal the route name this screen will be known
 *   by at the navigator.  (This is type-checked at the navigator.)
 * @param {RouteParams} - The type to use for `props.route.params`.
 */
export type RouteProp<+RouteName: string, +RouteParams: { ... } | void> = {|
  ...Route<RouteName>,
  +params: RouteParams,
|} /* FlowIssue: This intersection seems redundant -- the first operand
        should already be a subtype of the second.  But (once we switch to
        react-navigation types generated from upstream) it fixes a bunch of
        puzzling errors. */ & {
  +params: RouteParams,
  ...
};

/**
 * The type of the route params on the given screen component.
 *
 * This is intended for use in the params-list type for a navigator.
 * Sample usage, following the same example as in the upstream docs
 * at https://reactnavigation.org/docs/typescript/ :
 *
 *     export type RootStackParamList = {|
 *       'Profile': RouteParamsOf<typeof Profile>,
 *     |};
 *
 * This allows each component's route-params type to be defined within the
 * component's own source, just like props types.  Continuing the example,
 * the definition of the `Profile` component might contain a definition like
 * this one:
 *
 *     type Props = {|
 *       +navigation: StackNavigationProp<RootStackParamList, 'Profile'>,
 *       +route: RouteProp<'Profile', {| +userId: string |},
 *     |};
 *
 * (Or better yet, next to the params-list type we might define an alias
 * to simplify the `navigation` prop's type, to something like
 * `RootStackNavigationProp<'Profile'>`.)
 */
// The $NonMaybeType means that if `route` on the component is optional, we
// ignore the optional-ness and just look at the type the `params` property
// is expected to have when `route` is present at all.  This feels a bit
// ad hoc, but should be perfectly correct as far as it goes: even if
// `route` is optional, the navigator will always pass it, so as far as it's
// concerned `route` might as well be required.
//
// (Similarly if `route` has a type that permits null or void, which
// $NonMaybeType will also eliminate: the navigator will never be interested
// in passing one of those values anyway, so as far as it's concerned the
// type expected for `route` might as well exclude them.)
export type RouteParamsOf<-C> = $NonMaybeType<ElementConfig<C>['route']>['params'];

/**
 * Exactly like `useNavigation` upstream, but more typed.
 *
 * In particular, this provides a type that should be accurate when used on
 * any screen in the app, with methods only for using the app's main
 * navigator (which is an ancestor of all our other navigators.)
 *
 * This doesn't describe parts of the returned object that will exist only
 * when on a particular navigator.  If we start needing those, we can make
 * type-wrappers for them too.
 */
export function useNavigation(): AppNavigationMethods {
  // The upstream type sure isn't very informative: it lets us do this.
  return useNavigationInner<empty>();
  // The intended way to call it looks to be like this:
  //     useNavigationInner<AppNavigationMethods>()
  // But that gives a number of puzzling errors.  And the one thing it
  // actually does with the type argument is to determine the return type,
  // anyway.  We know what that should be, so just handle it ourselves.
}
