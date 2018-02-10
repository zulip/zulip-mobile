/* @flow */
import { createSelector } from 'reselect';

import { getDrafts } from '../directSelectors';
import { getActiveNarrowString } from '../baseSelectors';

export const getDraftForActiveNarrow = createSelector(
  getDrafts,
  getActiveNarrowString,
  (drafts, activeNarrowString) => drafts[activeNarrowString] || '',
);
