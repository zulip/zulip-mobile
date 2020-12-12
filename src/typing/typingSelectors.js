/* @flow strict-local */
import { createSelector } from 'reselect';

import type { Narrow, Selector, UserOrBot } from '../types';
import { getTyping } from '../directSelectors';
import { userIdsOfPmNarrow, isPmNarrow } from '../utils/narrow';
import { normalizeRecipientsAsUserIds } from '../utils/recipient';
import { NULL_ARRAY, NULL_USER } from '../nullObjects';
import { getAllUsersById } from '../users/userSelectors';

export const getCurrentTypingUsers: Selector<$ReadOnlyArray<UserOrBot>, Narrow> = createSelector(
  (state, narrow) => narrow,
  state => getTyping(state),
  state => getAllUsersById(state),
  (narrow, typing, allUsersById): UserOrBot[] => {
    if (!isPmNarrow(narrow)) {
      return NULL_ARRAY;
    }

    const recipients = userIdsOfPmNarrow(narrow);
    // TODO sort out this sorting (and consequent copying)
    const normalizedRecipients = normalizeRecipientsAsUserIds([...recipients]);
    const currentTyping = typing[normalizedRecipients];

    if (!currentTyping || !currentTyping.userIds) {
      return NULL_ARRAY;
    }

    return currentTyping.userIds.map(userId => allUsersById.get(userId) || NULL_USER);
  },
);
