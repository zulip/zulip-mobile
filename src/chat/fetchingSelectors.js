/* @flow strict-local */
import { createSelector } from 'reselect';

import type { Fetching, Selector, Narrow } from '../types';
import { getFetching } from '../directSelectors';

/** The value implicitly represented by a missing entry in FetchingState. */
export const DEFAULT_FETCHING = { older: false, newer: false };

export const getFetchingForNarrow = (narrow: Narrow): Selector<Fetching> =>
  createSelector(
    getFetching,
    fetching => fetching[JSON.stringify(narrow)] || DEFAULT_FETCHING,
  );

export const getIsFetching = (narrow: Narrow): Selector<boolean> =>
  createSelector(
    getFetchingForNarrow(narrow),
    (fetching: Fetching): boolean => fetching.older || fetching.newer,
  );
