/* @flow */
import { createSelector } from 'reselect';

import { NULL_DRAFT } from '../nullObjects';
import { getDrafts, getActiveNarrowString } from '../baseSelectors';

export const getDraftForActiveNarrow = createSelector(
  getDrafts,
  getActiveNarrowString,
  (drafts, activeNarrowString) => drafts[activeNarrowString] || NULL_DRAFT,
);
