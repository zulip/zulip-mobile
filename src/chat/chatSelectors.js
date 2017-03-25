import { specialNarrow } from '../utils/narrow';
import { normalizeRecipientsSansMe } from '../utils/message';

export const getAllMessages = (state) =>
  state.chat.messages;

export const getMessagesInActiveNarrow = (state) =>
  state.chat.messages[JSON.stringify(state.chat.narrow)] || [];

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
  }));
  const uniqueMostRecentRecipients = recipients.reduce((uniqueMap, recipient) => {
    if (!uniqueMap.has(recipient.emails) || uniqueMap.get(recipient.emails) < recipient.timestamp) {
      uniqueMap.set(recipient.emails, recipient.timestamp);
    }
    return uniqueMap;
  }, new Map());
  const sortedByTimestamp = Array.from(uniqueMostRecentRecipients.entries())
    .sort((a, b) => b[1] - a[1])
    .map(recipient => recipient[0]);
  return sortedByTimestamp;
};
