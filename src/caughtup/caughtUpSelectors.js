/* @flow strict-local */
import type { CaughtUp, CaughtUpState, GlobalState, Narrow } from '../types';
import { NULL_OBJECT } from '../nullObjects';

/** The value implicitly represented by a missing entry in CaughtUpState. */
export const DEFAULT_CAUGHTUP: CaughtUp = {
  older: false,
  newer: false,
};

export const getCaughtUp = (state: GlobalState): CaughtUpState => state.caughtUp || NULL_OBJECT;

export const getCaughtUpForNarrow = (state: GlobalState, narrow: Narrow): CaughtUp =>
  getCaughtUp(state)[JSON.stringify(narrow)] || DEFAULT_CAUGHTUP;
