/* @flow strict-local */
import { createSelector } from 'reselect';

import { getDrafts } from '../directSelectors';
import type { Narrow, Selector } from '../types';

export const getDraftForNarrow = (narrow: Narrow): Selector<string> =>
  createSelector(
    getDrafts,
    drafts => drafts[JSON.stringify(narrow)] || '',
  );
