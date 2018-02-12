/* @flow */
import { createSelector } from 'reselect';

import type { GlobalState } from '../types';

export const getNavigationRoutes = (state: GlobalState): Object[] => state.nav.routes;
export const getNavigationIndex = (state: GlobalState): number => state.nav.index;

export const getCurrentRouteParams = createSelector(
  getNavigationRoutes,
  getNavigationIndex,
  (routes, index) => routes && routes[index] && routes[index].params,
);

export const getCurrentRoute = (state: GlobalState): string =>
  state.nav.routes[state.nav.index].routeName;
