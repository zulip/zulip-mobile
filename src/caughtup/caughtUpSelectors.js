/* @flow strict-local */
import type { CaughtUp, CaughtUpState, GlobalState, Narrow } from '../types';
import { NULL_OBJECT } from '../nullObjects';
import { keyFromNarrow } from '../utils/narrow';

/** The value implicitly represented by a missing entry in CaughtUpState. */
export const DEFAULT_CAUGHTUP: CaughtUp = {
  older: false,
  newer: false,
};

export const getCaughtUp = (state: GlobalState): CaughtUpState => state.caughtUp || NULL_OBJECT;

export const getCaughtUpForNarrow = (state: GlobalState, narrow: Narrow): CaughtUp =>
  getCaughtUp(state)[keyFromNarrow(narrow)] || DEFAULT_CAUGHTUP;
