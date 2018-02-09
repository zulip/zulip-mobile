/* @flow */
import { createSelector } from 'reselect';

import type { GlobalState } from '../types';
import { NULL_CAUGHTUP, NULL_OBJECT } from '../nullObjects';
import { getActiveNarrowString } from '../baseSelectors';

export const getCaughtUp = (state: GlobalState): Object => state.caughtUp || NULL_OBJECT;

export const getCaughtUpForActiveNarrow = createSelector(
  getCaughtUp,
  getActiveNarrowString,
  (caughtUp, activeNarrowString) => caughtUp[activeNarrowString] || NULL_CAUGHTUP,
);
