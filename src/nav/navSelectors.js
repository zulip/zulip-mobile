/* @flow strict-local */
import type { NavigationState, Route } from '@react-navigation/native';

import * as NavigationService from './NavigationService';

export const getNavState = (): NavigationState => NavigationService.getState();

export const getNavigationRoutes = (): $ReadOnlyArray<Route<string>> => getNavState().routes;

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
