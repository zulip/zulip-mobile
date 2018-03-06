/* @flow */
import { createSelector } from 'reselect';

import { getDrafts } from '../directSelectors';

export const getDraftForActiveNarrow = (narrowString: string) =>
  createSelector(getDrafts, drafts => drafts[narrowString] || '');
