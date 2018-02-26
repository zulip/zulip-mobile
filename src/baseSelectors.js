/* @flow */
import { createSelector } from 'reselect';

import type { GlobalState } from './types';
import { allPrivateNarrowStr } from './utils/narrow';
import { getAllMessages, getNavigationRoutes, getNavigationIndex } from './directSelectors';
import { NULL_ARRAY } from './nullObjects';

export const getPrivateMessages = createSelector(
  getAllMessages,
  messages => messages[allPrivateNarrowStr] || NULL_ARRAY,
);

export const getCurrentRoute = (state: GlobalState): string =>
  state.nav.routes[state.nav.index].routeName;

export const getCurrentRouteParams = createSelector(
  getNavigationRoutes,
  getNavigationIndex,
  (routes, index) => routes && routes[index] && routes[index].params,
);

export const getActiveNarrow = createSelector(
  getCurrentRouteParams,
  params => (params && params.narrow) || NULL_ARRAY,
);

export const getActiveNarrowString = createSelector(getActiveNarrow, narrow =>
  JSON.stringify(narrow),
);
