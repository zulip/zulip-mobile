/* @flow */
import { createSelector } from 'reselect';

import type { GlobalState } from './types';
import { allPrivateNarrowStr } from './utils/narrow';
import { getAllMessages, getNavigationRoutes, getNavigationIndex, getNav } from './directSelectors';
import { NULL_ARRAY, NULL_OBJECT } from './nullObjects';

export const getPrivateMessages = createSelector(
  getAllMessages,
  messages => messages[allPrivateNarrowStr] || NULL_ARRAY,
);

export const getCurrentRoute = (state: GlobalState): string =>
  state.nav.routes[state.nav.index].routeName;

export const getCurrentRouteParams = createSelector(
  getNavigationRoutes,
  getNavigationIndex,
  (routes, index) => (routes && routes[index] && routes[index].params) || NULL_OBJECT,
  // return NULL_NAVIGATION_PARAMS if current route doent contain params
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
