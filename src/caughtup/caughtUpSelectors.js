/* @flow strict-local */
import type { CaughtUp, CaughtUpState, PerAccountState, Narrow } from '../types';
import { NULL_OBJECT } from '../nullObjects';
import { keyFromNarrow } from '../utils/narrow';

/** The value implicitly represented by a missing entry in CaughtUpState. */
export const DEFAULT_CAUGHTUP: CaughtUp = {
  older: false,
  newer: false,
};

export const getCaughtUp = (state: PerAccountState): CaughtUpState => state.caughtUp || NULL_OBJECT;

export const getCaughtUpForNarrowInner = (state: CaughtUpState, narrow: Narrow): CaughtUp =>
  state[keyFromNarrow(narrow)] || DEFAULT_CAUGHTUP;

export const getCaughtUpForNarrow = (state: PerAccountState, narrow: Narrow): CaughtUp =>
  getCaughtUpForNarrowInner(getCaughtUp(state), narrow);
