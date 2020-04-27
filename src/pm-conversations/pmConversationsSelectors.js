/* @flow strict-local */
import { createSelector } from 'reselect';

import type { Message, PmConversationData, Selector } from '../types';
import { getPrivateMessages } from '../message/messageSelectors';
import { getOwnEmail } from '../users/userSelectors';
import { getUnreadByPms, getUnreadByHuddles } from '../unread/unreadSelectors';
import { normalizeRecipientsSansMe, getRecipientsIds } from '../utils/recipient';

export const getRecentConversations: Selector<PmConversationData[]> = createSelector(
  getOwnEmail,
  getPrivateMessages,
  getUnreadByPms,
  getUnreadByHuddles,
  (
    ownEmail: string,
    messages: Message[],
    unreadPms: { [number]: number },
    unreadHuddles: { [string]: number },
  ): PmConversationData[] => {
    const recipients = messages.map(msg => ({
      ids: getRecipientsIds(msg, ownEmail),
      emails: normalizeRecipientsSansMe(msg.display_recipient, ownEmail),
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
