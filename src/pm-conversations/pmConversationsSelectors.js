/* @flow strict-local */
import { createSelector } from 'reselect';

import type { Message, PmConversationData, Selector } from '../types';
import { getPrivateMessages } from '../message/messageSelectors';
import { getOwnEmail } from '../account/accountsSelectors';
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
      ids: getRecipientsIds(msg.display_recipient, ownEmail),
      emails: normalizeRecipientsSansMe(msg.display_recipient, ownEmail),
      timestamp: msg.timestamp,
      msgId: msg.id,
    }));

    const groupedRecipients = recipients.reduce((uniqueMap, recipient) => {
      const prev = uniqueMap.get(recipient.emails);
      if (!prev || recipient.msgId > prev.msgId) {
        uniqueMap.set(recipient.emails, {
          ids: recipient.ids,
          recipients: recipient.emails,
          timestamp: recipient.timestamp || 0,
          msgId: recipient.msgId,
        });
      }
      return uniqueMap;
    }, new Map());

    const sortedByMostRecent = Array.from(groupedRecipients.values()).sort(
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
