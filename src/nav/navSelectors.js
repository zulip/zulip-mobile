/* @flow strict-local */
import type { GlobalState, NavigationRouteState, NavigationState } from '../types';
import type { Narrow } from '../api/apiTypes';

export const getNav = (state: GlobalState): NavigationState => state.nav;

const getNavigationRoutes = (state: GlobalState): NavigationRouteState[] => state.nav.routes;

const getNavigationIndex = (state: GlobalState): number => getNav(state).index;

const getCurrentRoute = (state: GlobalState): void | NavigationRouteState =>
  getNavigationRoutes(state)[getNavigationIndex(state)];

export const getCurrentRouteName = (state: GlobalState): void | string =>
  getCurrentRoute(state)?.routeName;

export const getCurrentRouteParams = (state: GlobalState): void | { narrow?: Narrow } =>
  getCurrentRoute(state)?.params;

export const getChatScreenParams = (state: GlobalState): { narrow?: Narrow } =>
  getCurrentRouteParams(state) || { narrow: undefined };

export const getCanGoBack = (state: GlobalState) => state.nav.index > 0;

export const getSameRoutesCount = (state: GlobalState): number => {
  const nav = getNav(state);
  let i = nav.routes.length - 1;
  while (i >= 0) {
    if (nav.routes[i].routeName !== nav.routes[nav.routes.length - 1].routeName) {
      break;
    }
    i--;
  }
  return nav.routes.length - i - 1;
};
