/* @flow strict-local */
import { createSelector } from 'reselect';

import type { Narrow, Selector, UserOrBot } from '../types';
import { getTyping } from '../directSelectors';
import { isPrivateOrGroupNarrow } from '../utils/narrow';
import { normalizeRecipientsAsUserIds } from '../utils/recipient';
import { NULL_ARRAY, NULL_USER } from '../nullObjects';
import { getAllUsersById, getAllUsersByEmail } from '../users/userSelectors';

export const getCurrentTypingUsers: Selector<$ReadOnlyArray<UserOrBot>, Narrow> = createSelector(
  (state, narrow) => narrow,
  state => getTyping(state),
  state => getAllUsersById(state),
  state => getAllUsersByEmail(state),
  (narrow, typing, allUsersById, allUsersByEmail): UserOrBot[] => {
    if (!isPrivateOrGroupNarrow(narrow)) {
      return NULL_ARRAY;
    }

    const recipients = narrow[0].operand.split(',').map(email => {
      const userId = allUsersByEmail.get(email)?.user_id;
      if (userId === undefined) {
        throw new Error(`Narrow contains email '${email}' that does not map to any user.`);
      }
      return { user_id: userId };
    });
    const normalizedRecipients = normalizeRecipientsAsUserIds(recipients);
    const currentTyping = typing[normalizedRecipients];

    if (!currentTyping || !currentTyping.userIds) {
      return NULL_ARRAY;
    }

    return currentTyping.userIds.map(userId => allUsersById.get(userId) || NULL_USER);
  },
);
