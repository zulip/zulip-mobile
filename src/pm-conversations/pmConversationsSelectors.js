/* @flow strict-local */
import { createSelector } from 'reselect';

import type { Message, PmConversationData, Selector, User } from '../types';
import { getPrivateMessages } from '../message/messageSelectors';
import { getOwnUser } from '../users/userSelectors';
import { getUnreadByPms, getUnreadByHuddles } from '../unread/unreadSelectors';
import { normalizeRecipientsSansMe, pmUnreadsKeyFromMessage } from '../utils/recipient';

export const getRecentConversations: Selector<PmConversationData[]> = createSelector(
  getOwnUser,
  getPrivateMessages,
  getUnreadByPms,
  getUnreadByHuddles,
  (
    ownUser: User,
    messages: Message[],
    unreadPms: { [number]: number },
    unreadHuddles: { [string]: number },
  ): PmConversationData[] => {
    const recipients = messages.map(msg => ({
      ids: pmUnreadsKeyFromMessage(msg, ownUser.user_id),
      emails: normalizeRecipientsSansMe(msg.display_recipient, ownUser.email),
      msgId: msg.id,
    }));

    const latestByRecipient = new Map();
    recipients.forEach(recipient => {
      const prev = latestByRecipient.get(recipient.emails);
      if (!prev || recipient.msgId > prev.msgId) {
        latestByRecipient.set(recipient.emails, {
          ids: recipient.ids,
          recipients: recipient.emails,
          msgId: recipient.msgId,
        });
      }
    });

    const sortedByMostRecent = Array.from(latestByRecipient.values()).sort(
      (a, b) => +b.msgId - +a.msgId,
    );

    return sortedByMostRecent.map(recipient => ({
      ...recipient,
      unread:
        // This business of looking in one place and then the other is kind
        // of messy.  Fortunately it always works, because the key spaces
        // are disjoint: all `unreadHuddles` keys contain a comma, and all
        // `unreadPms` keys don't.
        /* $FlowFixMe: The keys of unreadPms are logically numbers, but because it's an object they
         end up converted to strings, so this access with string keys works.  We should probably use
         a Map for this and similar maps. */
        unreadPms[recipient.ids] || unreadHuddles[recipient.ids],
    }));
  },
);

export const getUnreadConversations: Selector<PmConversationData[]> = createSelector(
  getRecentConversations,
  conversations => conversations.filter(c => c.unread > 0),
);
