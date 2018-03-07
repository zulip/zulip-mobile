/* @flow */
import { createSelector } from 'reselect';

import { getDrafts } from '../directSelectors';
import type { Narrow } from '../types';

export const getDraftForActiveNarrow = (narrow: Narrow) =>
  createSelector(getDrafts, drafts => drafts[JSON.stringify(narrow)] || '');
