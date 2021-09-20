/* @flow strict-local */
import type { Fetching, PerAccountState, Narrow } from '../types';
import { getFetching } from '../directSelectors';
import { keyFromNarrow } from '../utils/narrow';

/** The value implicitly represented by a missing entry in FetchingState. */
export const DEFAULT_FETCHING = { older: false, newer: false };

export const getFetchingForNarrow = (state: PerAccountState, narrow: Narrow): Fetching =>
  getFetching(state)[keyFromNarrow(narrow)] || DEFAULT_FETCHING;
