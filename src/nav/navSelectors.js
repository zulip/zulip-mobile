/* @flow strict-local */
import { createSelector } from 'reselect';

import type { GlobalState, NavigationRouteState, NavigationState } from '../types';

export const getNav = (state: GlobalState): NavigationState => state.nav;

const getNavigationRoutes = (state: GlobalState): NavigationRouteState[] => state.nav.routes;

const getNavigationIndex = (state: GlobalState): number => state.nav.index;

export const getCurrentRouteName = (state: GlobalState): string =>
  state.nav.routes[state.nav.index].routeName;

export const getCurrentRouteParams = createSelector(
  getNavigationRoutes,
  getNavigationIndex,
  (routes, index) => routes && routes[index] && routes[index].params,
);

export const getChatScreenParams = createSelector(
  getCurrentRouteParams,
  params => params || { narrow: undefined },
);

export const getTopMostNarrow = createSelector(getNav, nav => {
  const { routes } = nav;
  let { index } = nav;
  while (index >= 0) {
    if (routes[index].routeName === 'chat') {
      return routes[index].params.narrow;
    }
    index--;
  }
  return undefined;
});

export const getCanGoBack = (state: GlobalState) => state.nav.index > 0;

export const getSameRoutesCount = createSelector(getNav, nav => {
  let i = nav.routes.length - 1;
  while (i >= 0) {
    if (nav.routes[i].routeName !== nav.routes[nav.routes.length - 1].routeName) {
      break;
    }
    i--;
  }
  return nav.routes.length - i - 1;
});
