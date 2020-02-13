/* @flow strict-local */
import type { Fetching, GlobalState, Narrow } from '../types';
import { getFetching } from '../directSelectors';

/** The value implicitly represented by a missing entry in FetchingState. */
export const DEFAULT_FETCHING = { older: false, newer: false };

export const getFetchingForNarrow = (state: GlobalState, narrow: Narrow): Fetching =>
  getFetching(state)[JSON.stringify(narrow)] || DEFAULT_FETCHING;
