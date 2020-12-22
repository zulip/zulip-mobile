/* @flow strict-local */
import { createSelector } from 'reselect';

import type { Message, PmConversationData, Selector, User } from '../types';
import { getPrivateMessages } from '../message/messageSelectors';
import { getAllUsersById, getOwnUser } from '../users/userSelectors';
import { getUnreadByPms, getUnreadByHuddles } from '../unread/unreadSelectors';
import { pmUnreadsKeyFromMessage, pmKeyRecipientUsersFromMessage } from '../utils/recipient';

export const getRecentConversations: Selector<PmConversationData[]> = createSelector(
  getOwnUser,
  getPrivateMessages,
  getUnreadByPms,
  getUnreadByHuddles,
  getAllUsersById,
  (
    ownUser: User,
    messages: Message[],
    unreadPms: { [number]: number },
    unreadHuddles: { [string]: number },
    allUsersById,
  ): PmConversationData[] => {
    const recipients = messages
      .map(msg => {
        // Note this can be a different set of users from those in `keyRecipients`.
        const unreadsKey = pmUnreadsKeyFromMessage(msg, ownUser.user_id);
        const keyRecipients = pmKeyRecipientUsersFromMessage(msg, allUsersById, ownUser.user_id);
        return keyRecipients === null ? null : { unreadsKey, keyRecipients, msgId: msg.id };
      })
      .filter(Boolean);

    const latestByRecipient = new Map();
    recipients.forEach(recipient => {
      const prev = latestByRecipient.get(recipient.unreadsKey);
      if (!prev || recipient.msgId > prev.msgId) {
        latestByRecipient.set(recipient.unreadsKey, recipient);
      }
    });

    const sortedByMostRecent = Array.from(latestByRecipient.values()).sort(
      (a, b) => +b.msgId - +a.msgId,
    );

    return sortedByMostRecent.map(recipient => ({
      key: recipient.unreadsKey,
      keyRecipients: recipient.keyRecipients,
      msgId: recipient.msgId,
      unread:
        // This business of looking in one place and then the other is kind
        // of messy.  Fortunately it always works, because the key spaces
        // are disjoint: all `unreadHuddles` keys contain a comma, and all
        // `unreadPms` keys don't.
        /* $FlowFixMe: The keys of unreadPms are logically numbers, but because it's an object they
         end up converted to strings, so this access with string keys works.  We should probably use
         a Map for this and similar maps. */
        unreadPms[recipient.unreadsKey] || unreadHuddles[recipient.unreadsKey],
    }));
  },
);

export const getUnreadConversations: Selector<PmConversationData[]> = createSelector(
  getRecentConversations,
  conversations => conversations.filter(c => c.unread > 0),
);
