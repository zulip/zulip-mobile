/* @flow */
import { createSelector } from 'reselect';

import { allPrivateNarrowStr } from './utils/narrow';
import { getActiveNarrow, getAllMessages } from './directSelectors';
import { NULL_ARRAY } from './nullObjects';

export const getPrivateMessages = createSelector(
  getAllMessages,
  messages => messages[allPrivateNarrowStr] || NULL_ARRAY,
);

export const getActiveNarrowString = createSelector(getActiveNarrow, narrow =>
  JSON.stringify(narrow),
);
