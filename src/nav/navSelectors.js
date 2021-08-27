/* @flow strict-local */
import type { NavigationState, Route, ScreenParams } from '@react-navigation/native';

import * as NavigationService from './NavigationService';

export const getNavState = (): NavigationState => NavigationService.getState();

export const getNavigationRoutes = (): $ReadOnlyArray<Route<string>> => getNavState().routes;

const getNavigationIndex = () => getNavState().index;

const getCurrentRoute = (): void | Route<string> => getNavigationRoutes()[getNavigationIndex()];

export const getCurrentRouteName = (): void | string => getCurrentRoute()?.name;

export const getCurrentRouteParams = (): void | ScreenParams => getCurrentRoute()?.params;

export const getChatScreenParams = (): ScreenParams | {| narrow: void |} =>
  getCurrentRouteParams() ?? { narrow: undefined };

export const getSameRoutesCount = (): number => {
  const routes = getNavigationRoutes();
  let i = routes.length - 1;
  while (i >= 0) {
    if (routes[i].name !== routes[routes.length - 1].name) {
      break;
    }
    i--;
  }
  return routes.length - i - 1;
};
