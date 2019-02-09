/* @flow strict-local */
import { createSelector } from 'reselect';

import type { CaughtUp, CaughtUpState, GlobalState, Narrow, Selector } from '../types';
import { NULL_OBJECT } from '../nullObjects';

/** The value implicitly represented by a missing entry in CaughtUpState. */
export const DEFAULT_CAUGHTUP: CaughtUp = {
  older: false,
  newer: false,
};

export const getCaughtUp = (state: GlobalState): CaughtUpState => state.caughtUp || NULL_OBJECT;

export const getCaughtUpForNarrow = (narrow: Narrow): Selector<CaughtUp> =>
  createSelector(getCaughtUp, caughtUp => caughtUp[JSON.stringify(narrow)] || DEFAULT_CAUGHTUP);
