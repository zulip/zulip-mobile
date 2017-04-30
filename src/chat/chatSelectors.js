import { specialNarrow } from '../utils/narrow';
import { normalizeRecipientsSansMe, shouldBeMuted } from '../utils/message';

export const getAllMessages = (state) =>
  state.chat.messages;

export const getMessagesInActiveNarrow = (state) =>
  state.chat.messages[JSON.stringify(state.chat.narrow)] || [];

export const getShownMessagesInActiveNarrow = (state) =>
  getMessagesInActiveNarrow(state).filter(item =>
    !shouldBeMuted(item, state.chat.narrow, state.subscriptions, state.mute)
  );

export const getAnchor = (state) => {
  const messages = getMessagesInActiveNarrow(state);

  if (messages.length === 0) {
    return undefined;
  }

  return {
    older: messages[0].id,
    newer: messages[messages.length - 1].id,
  };
};

export const getRecentConversations = (state) => {
  const selfEmail = state.accounts[0].email;
  const privateNarrowStr = JSON.stringify(specialNarrow('private'));
  const messages = state.chat.messages[privateNarrowStr] || [];

  const recipients = messages.map(msg => ({
    emails: normalizeRecipientsSansMe(msg.display_recipient, selfEmail),
    timestamp: msg.timestamp,
    isRead: state.flags.read[msg.id] || 0,
  }));

  const groupedRecipients = recipients.reduce((uniqueMap, recipient) => {
    if (!uniqueMap.has(recipient.emails)) {
      // new entry
      uniqueMap.set(recipient.emails, {
        recipients: recipient.emails,
        timestamp: recipient.timestamp || 0,
        unread: +!recipient.isRead,
      });
    } else {
      // update existing entry
      const prev = uniqueMap.get(recipient.emails);
      uniqueMap.set(recipient.emails, {
        recipients: recipient.emails,
        timestamp: Math.max(prev.timestamp || 0, recipient.timestamp || 0),
        unread: prev.unread + +!recipient.isRead,
      });
    }
    return uniqueMap;
  }, new Map());

  // sort by most recent timestamp
  return Array.from(groupedRecipients.values())
    .sort((a, b) => +b.timestamp - +a.timestamp);
};
