/* @flow */
import { createSelector } from 'reselect';

import { getSession, getFetching } from '../directSelectors';
import { getActiveNarrowString } from '../baseSelectors';

import { NULL_FETCHING } from '../nullObjects';

export const getFetchingForActiveNarrow = createSelector(
  getFetching,
  getActiveNarrowString,
  (fetching, activeNarrowString) => fetching[activeNarrowString] || NULL_FETCHING,
);

export const getIsFetching = createSelector(
  getSession,
  getFetchingForActiveNarrow,
  (session, fetching) => session.needsInitialFetch || fetching.older || fetching.newer,
);
