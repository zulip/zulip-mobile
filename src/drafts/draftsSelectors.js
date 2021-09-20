/* @flow strict-local */
import type { Narrow, PerAccountState } from '../types';
import { keyFromNarrow } from '../utils/narrow';

export const getDraftForNarrow = (state: PerAccountState, narrow: Narrow): string =>
  state.drafts[keyFromNarrow(narrow)] || '';
