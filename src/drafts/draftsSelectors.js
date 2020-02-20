/* @flow strict-local */
import type { Narrow, GlobalState } from '../types';

export const getDraftForNarrow = (state: GlobalState, narrow: Narrow): string =>
  state.drafts[JSON.stringify(narrow)] || '';
