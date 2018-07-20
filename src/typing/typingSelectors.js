/* @flow */
import { createSelector } from 'reselect';

import type { Narrow } from '../types';
import { getTyping, getActiveUsers } from '../selectors';
import { getOwnEmail } from '../account/accountSelectors';
import { getUserById } from '../users/userHelpers';
import { isPrivateOrGroupNarrow } from '../utils/narrow';
import { normalizeRecipients } from '../utils/message';
import { NULL_ARRAY } from '../nullObjects';

export const getCurrentTypingUsers = (narrow: Narrow) =>
  createSelector(getTyping, getActiveUsers, getOwnEmail, (typing, users, ownEmail) => {
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
  });
