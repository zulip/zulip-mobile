/* @flow */
import { createSelector } from 'reselect';

import type { GlobalState } from './types';
import { getNavigationRoutes, getNavigationIndex, getNav } from './directSelectors';

export const getCurrentRoute = (state: GlobalState): string =>
  state.nav.routes[state.nav.index].routeName;

export const getCurrentRouteParams = createSelector(
  getNavigationRoutes,
  getNavigationIndex,
  (routes, index) => routes && routes[index] && routes[index].params,
);

export const getCurrentRouteNarrow = createSelector(
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
