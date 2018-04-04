/* @flow */
import { createSelector } from 'reselect';

import { getPrivateMessages } from '../baseSelectors';
import { getOwnEmail } from '../account/accountSelectors';
import { getUnreadByPms, getUnreadByHuddles } from '../unread/unreadSelectors';
import { normalizeRecipientsSansMe, getRecipientsIds } from '../utils/message';

export const getRecentConversations = createSelector(
  getOwnEmail,
  getPrivateMessages,
  getUnreadByPms,
  getUnreadByHuddles,
  (ownEmail, messages, unreadPms, unreadHuddles) => {
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
      unread: unreadPms[recipient.ids] || unreadHuddles[recipient.ids],
    }));
  },
);

export const getUnreadConversations = createSelector(getRecentConversations, conversations =>
  conversations.filter(c => c.unread > 0),
);
