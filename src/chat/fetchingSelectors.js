/* @flow strict-local */
import { createSelector } from 'reselect';

import type { Fetching, Narrow } from '../types';
import { getFetching } from '../directSelectors';
import { NULL_FETCHING } from '../nullObjects';

export const getFetchingForActiveNarrow = (narrow: Narrow) =>
  createSelector(getFetching, fetching => fetching[JSON.stringify(narrow)] || NULL_FETCHING);

export const getIsFetching = (narrow: Narrow) =>
  createSelector(
    getFetchingForActiveNarrow(narrow),
    (fetching: Fetching): boolean => fetching.older || fetching.newer,
  );
