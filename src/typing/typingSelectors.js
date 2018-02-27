/* @flow */
import { createSelector } from 'reselect';

import { getTyping, getUsers } from '../directSelectors';
import { getActiveNarrow } from '../baseSelectors';
import { getOwnEmail } from '../account/accountSelectors';
import { getUserById } from '../users/userHelpers';
import { isPrivateOrGroupNarrow } from '../utils/narrow';
import { normalizeRecipients } from '../utils/message';

export const getCurrentTypingUsers = createSelector(
  getActiveNarrow,
  getTyping,
  getUsers,
  getOwnEmail,
  (activeNarrow, typing, users, ownEmail) => {
    if (!isPrivateOrGroupNarrow(activeNarrow)) {
      return undefined;
    }

    const recipients = activeNarrow[0].operand.split(',').map(email => ({ email }));
    const normalizedRecipients = normalizeRecipients(recipients);
    const currentTyping = typing[normalizedRecipients];

    if (!currentTyping || !currentTyping.userIds) {
      return undefined;
    }

    return currentTyping.userIds.map(userId => getUserById(users, userId));
  },
);
