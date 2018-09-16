/* @flow */
import { createSelector } from 'reselect';

import { ALL_PRIVATE_NARROW_STR } from './utils/narrow';
import { getAllNarrows, getMessages } from './directSelectors';
import { NULL_ARRAY } from './nullObjects';

export const getPrivateMessages = createSelector(getAllNarrows, getMessages, (narrows, messages) =>
  (narrows[ALL_PRIVATE_NARROW_STR] || NULL_ARRAY).map(id => messages[id]),
);
