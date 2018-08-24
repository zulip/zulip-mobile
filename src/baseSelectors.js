/* @flow */
import { createSelector } from 'reselect';

import type { GlobalState } from './types';
import { ALL_PRIVATE_NARROW_STR } from './utils/narrow';
import {
  getAllNarrows,
  getNavigationRoutes,
  getNavigationIndex,
  getNav,
  getMessages,
} from './directSelectors';
import { NULL_ARRAY } from './nullObjects';

export const getPrivateMessages = createSelector(getAllNarrows, getMessages, (narrows, messages) =>
  (narrows[ALL_PRIVATE_NARROW_STR] || NULL_ARRAY).map(id => messages[id]),
);

export const getCurrentRoute = (state: GlobalState): string =>
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
