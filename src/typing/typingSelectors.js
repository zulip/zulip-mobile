/* @flow strict-local */
import { createSelector } from 'reselect';

import type { Narrow, Selector, UserOrBot } from '../types';
import { getTyping } from '../directSelectors';
import { userIdsOfPmNarrow, isPmNarrow } from '../utils/narrow';
import { pmTypingKeyFromPmKeyIds } from '../utils/recipient';
import { NULL_ARRAY } from '../nullObjects';
import { getAllUsersById } from '../users/userSelectors';

export const getCurrentTypingUsers: Selector<$ReadOnlyArray<UserOrBot>, Narrow> = createSelector(
  (state, narrow) => narrow,
  state => getTyping(state),
  state => getAllUsersById(state),
  (narrow, typing, allUsersById): $ReadOnlyArray<UserOrBot> => {
    if (!isPmNarrow(narrow)) {
      return NULL_ARRAY;
    }

    const typingKey = pmTypingKeyFromPmKeyIds(userIdsOfPmNarrow(narrow));
    const currentTyping = typing[typingKey];

    if (!currentTyping || !currentTyping.userIds) {
      return NULL_ARRAY;
    }

    return currentTyping.userIds.map(userId => allUsersById.get(userId)).filter(Boolean);
  },
);
