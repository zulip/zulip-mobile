/* @flow */
import { createSelector } from 'reselect';

import type { Narrow } from '../types';
import { getTyping, getUsers } from '../directSelectors';
import { getOwnEmail } from '../account/accountSelectors';
import { getUserById } from '../users/userHelpers';
import { isPrivateOrGroupNarrow } from '../utils/narrow';
import { normalizeRecipients } from '../utils/message';

export const getCurrentTypingUsers = (narrow: Narrow) =>
  createSelector(getTyping, getUsers, getOwnEmail, (typing, users, ownEmail) => {
    if (!isPrivateOrGroupNarrow(narrow)) {
      return [];
    }

    const recipients = narrow[0].operand.split(',').map(email => ({ email }));
    const normalizedRecipients = normalizeRecipients(recipients);
    const currentTyping = typing[normalizedRecipients];

    if (!currentTyping || !currentTyping.userIds) {
      return [];
    }

    return currentTyping.userIds.map(userId => getUserById(users, userId));
  });
