/* @flow strict-local */
import * as NavigationService from './NavigationService';

export const getSameRoutesCount = (): number => {
  const routes = NavigationService.getState().routes;
  let i = routes.length - 1;
  while (i >= 0) {
    if (routes[i].name !== routes[routes.length - 1].name) {
      break;
    }
    i--;
  }
  return routes.length - i - 1;
};
