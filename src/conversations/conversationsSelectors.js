/* @flow */
import { createSelector } from 'reselect';

import { getOwnEmail } from '../account/accountSelectors';
import { getUnreadByPms, getUnreadByHuddles } from '../unread/unreadSelectors';
import { getPrivateMessages } from '../baseSelectors';
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
    }));

    const groupedRecipients = recipients.reduce((uniqueMap, recipient) => {
      if (!uniqueMap.has(recipient.emails)) {
        // new entry
        uniqueMap.set(recipient.emails, {
          ids: recipient.ids,
          recipients: recipient.emails,
          timestamp: recipient.timestamp || 0,
        });
      } else {
        // update existing entry
        const prev = uniqueMap.get(recipient.emails);
        uniqueMap.set(recipient.emails, {
          ids: recipient.ids,
          recipients: recipient.emails,
          timestamp: Math.max(prev.timestamp || 0, recipient.timestamp || 0),
        });
      }
      return uniqueMap;
    }, new Map());

    const sortedByMostRecent = Array.from(groupedRecipients.values()).sort(
      (a, b) => +b.timestamp - +a.timestamp,
    );

    return sortedByMostRecent.map(recipient => ({
      ...recipient,
      unread: unreadPms[recipient.ids] || unreadHuddles[recipient.ids],
    }));
  },
);
