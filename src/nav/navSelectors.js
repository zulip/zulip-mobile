/* @flow strict-local */
import type { NavigationState, NavigationRoute } from 'react-navigation';

import * as NavigationService from './NavigationService';

export const getNavState = (): NavigationState => NavigationService.getState();

export const getNavigationRoutes = () => getNavState().routes;

const getNavigationIndex = () => getNavState().index;

const getCurrentRoute = (): void | NavigationRoute => getNavigationRoutes()[getNavigationIndex()];

export const getCurrentRouteName = () => getCurrentRoute()?.routeName;

export const getCurrentRouteParams = () => getCurrentRoute()?.params;

export const getChatScreenParams = () => getCurrentRouteParams() ?? { narrow: undefined };

export const getSameRoutesCount = () => {
  const routes = getNavigationRoutes();
  let i = routes.length - 1;
  while (i >= 0) {
    if (routes[i].routeName !== routes[routes.length - 1].routeName) {
      break;
    }
    i--;
  }
  return routes.length - i - 1;
};
