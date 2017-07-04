/* @flow */
import type { GlobalState, Message } from '../types';
import { specialNarrow, isPrivateOrGroupNarrow } from '../utils/narrow';
import { normalizeRecipients, normalizeRecipientsSansMe, shouldBeMuted } from '../utils/message';
import { countUnread } from '../utils/unread';
import { getUserById } from '../users/usersSelectors';

export const getAllMessages = (state: GlobalState): Message[] =>
  state.chat.messages;

export const getMessagesInActiveNarrow = (state: GlobalState): Message[] =>
  state.chat.messages[JSON.stringify(state.chat.narrow)] || [];

export const getShownMessagesInActiveNarrow = (state: GlobalState): Message[] =>
  getMessagesInActiveNarrow(state).filter(item =>
    !shouldBeMuted(item, state.chat.narrow, state.subscriptions, state.mute)
  );

export const getAnchor = (state: GlobalState) => {
  const messages = getMessagesInActiveNarrow(state);

  if (messages.length === 0) {
    return undefined;
  }

  return {
    older: messages[0].id,
    newer: messages[messages.length - 1].id,
  };
};

export const getRecentConversations = (state: GlobalState) => {
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

export const getPrivateMessages = (state: GlobalState): Message[] =>
  state.chat.messages[JSON.stringify(specialNarrow('private'))] || [];

export const getUnreadPrivateMessagesCount = (state: GlobalState): number =>
  countUnread(getPrivateMessages(state).map(msg => msg.id), state.flags.read);

export const getCurrentTypingUsers = (state: GlobalState) => {
  if (!isPrivateOrGroupNarrow(state.chat.narrow)) {
    return undefined;
  }

  const recipients = state.chat.narrow[0].operand.split(',').map(email => ({ email }));
  const selfEmail = state.accounts[0].email;
  const normalizedRecipients = normalizeRecipients(recipients, selfEmail);
  const currentTyping = state.typing[normalizedRecipients];

  if (!currentTyping) {
    return undefined;
  }

  return currentTyping.map(userId => getUserById(state.users, userId));
};

export const getLastTopicInActiveNarrow = (state: GlobalState): string => {
  const messagesInActiveNarrow = getMessagesInActiveNarrow(state);
  const lastMessageWithSubject = messagesInActiveNarrow.slice().reverse().find(msg => msg.subject);
  return (lastMessageWithSubject && lastMessageWithSubject.subject) || '';
};
