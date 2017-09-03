/* @flow */
import { createSelector } from 'reselect';

import { getDrafts, getActiveNarrowString } from '../baseSelectors';

export const getDraftForActiveNarrow = createSelector(
  getDrafts,
  getActiveNarrowString,
  (drafts, activeNarrowString) => drafts[activeNarrowString] || '',
);
