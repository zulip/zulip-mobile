/* @flow */
import { createSelector } from 'reselect';

import type { GlobalState } from '../types';
import { NULL_CAUGHTUP } from '../nullObjects';
import { getActiveNarrowString } from '../directSelectors';

export const getCaughtUp = (state: GlobalState): Object => state.caughtUp;

export const getCaughtUpForActiveNarrow = createSelector(
  getCaughtUp,
  getActiveNarrowString,
  (caughtUp, activeNarrowString) => caughtUp[activeNarrowString] || NULL_CAUGHTUP,
);
