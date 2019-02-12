/* @flow strict-local */
import { createSelector } from 'reselect';

import type { Narrow, Selector, User } from '../types';
import { getTyping, getUsers } from '../directSelectors';
import { getOwnEmail } from '../account/accountsSelectors';
import { getUserById } from '../users/userHelpers';
import { isPrivateOrGroupNarrow } from '../utils/narrow';
import { normalizeRecipients } from '../utils/recipient';
import { NULL_ARRAY } from '../nullObjects';

export const getCurrentTypingUsers: Selector<$ReadOnlyArray<User>, Narrow> = createSelector(
  (state, narrow) => narrow,
  state => getTyping(state),
  state => getUsers(state),
  state => getOwnEmail(state),
  (narrow, typing, users, ownEmail): User[] => {
    if (!isPrivateOrGroupNarrow(narrow)) {
      return NULL_ARRAY;
    }

    const recipients = narrow[0].operand.split(',').map(email => ({ email }));
    const normalizedRecipients = normalizeRecipients(recipients);
    const currentTyping = typing[normalizedRecipients];

    if (!currentTyping || !currentTyping.userIds) {
      return NULL_ARRAY;
    }

    return currentTyping.userIds.map(userId => getUserById(users, userId));
  },
);
