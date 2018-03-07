/* @flow */
import { createSelector } from 'reselect';

import type { Narrow } from '../types';
import { getSession, getFetching } from '../directSelectors';
import { NULL_FETCHING } from '../nullObjects';

export const getFetchingForActiveNarrow = (narrow: Narrow) =>
  createSelector(getFetching, fetching => fetching[JSON.stringify(narrow)] || NULL_FETCHING);

export const getIsFetching = (narrow: Narrow) =>
  createSelector(
    getSession,
    getFetchingForActiveNarrow(narrow),
    (session, fetching) => session.needsInitialFetch || fetching.older || fetching.newer,
  );
