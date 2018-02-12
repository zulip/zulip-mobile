/* @flow */
import { createSelector } from 'reselect';

import { allPrivateNarrowStr } from './utils/narrow';
import { getAllMessages } from './directSelectors';
import { getCurrentRouteParams } from './nav/navigationSelectors';
import { NULL_ARRAY } from './nullObjects';

export const getPrivateMessages = createSelector(
  getAllMessages,
  messages => messages[allPrivateNarrowStr] || NULL_ARRAY,
);

export const getActiveNarrow = createSelector(
  getCurrentRouteParams,
  params => (params && params.narrow) || NULL_ARRAY,
);

export const getActiveNarrowString = createSelector(getActiveNarrow, narrow =>
  JSON.stringify(narrow),
);
