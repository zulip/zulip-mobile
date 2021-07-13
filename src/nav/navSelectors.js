/* @flow strict-local */
import type { Route } from '@react-navigation/native';

import * as NavigationService from './NavigationService';

export const getNavigationRoutes = (): $ReadOnlyArray<Route<string>> =>
  NavigationService.getState().routes;

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
