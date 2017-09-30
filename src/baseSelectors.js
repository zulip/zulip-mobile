/* @flow */
import { createSelector } from 'reselect';

import { allPrivateNarrowStr } from './utils/narrow';
import { getAllMessages } from './directSelectors';
import { NULL_ARRAY } from './nullObjects';

export const getPrivateMessages = createSelector(
  getAllMessages,
  messages => messages[allPrivateNarrowStr] || NULL_ARRAY,
);
