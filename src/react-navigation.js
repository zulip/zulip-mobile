/**
 * Helpers for using react-navigation and its relatives.
 *
 * @flow strict-local
 */

import { type ElementConfig } from 'react';
import {
  useNavigation as useNavigationInner,
  type LeafRoute,
  type ScreenParams,
} from '@react-navigation/native';

import type { GlobalParamList } from './nav/globalTypes';

/* eslint-disable flowtype/generic-spacing */

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
export type RouteProp<+RouteName: string, +RouteParams: ScreenParams | void> = {|
  ...LeafRoute<RouteName>,
  +params: RouteParams,
|};

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
export type RouteParamsOf<-C> = $PropertyType<$PropertyType<ElementConfig<C>, 'route'>, 'params'>;

/**
 * Exactly like `useNavigation` upstream, but more typed.
 *
 * In particular, we use our `GlobalParamList` type.
 */
export function useNavigation() {
  return useNavigationInner<GlobalParamList>();
}
