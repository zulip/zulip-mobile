/* @flow */
import { createSelector } from 'reselect';

import { getOwnEmail } from '../account/accountSelectors';
import { getUserById } from '../users/userHelpers';
import { getActiveNarrow, getTyping, getUsers } from '../selectors';
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

    if (!currentTyping) {
      return undefined;
    }

    return currentTyping.map(userId => getUserById(users, userId));
  },
);
