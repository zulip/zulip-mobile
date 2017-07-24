/* @flow */
import { createSelector } from 'reselect';

import type { GlobalState } from '../types';
import { getOwnEmail } from '../account/accountSelectors';
import { getUserById } from '../users/userSelectors';
import {
  getAllMessages,
  getSubscriptions,
  getActiveNarrow,
  getMute,
  getTyping,
  getUsers,
  getReadFlags,
  getStreams,
} from '../selectors';
import { specialNarrow, isPrivateOrGroupNarrow } from '../utils/narrow';
import { normalizeRecipients, normalizeRecipientsSansMe, shouldBeMuted } from '../utils/message';
import { countUnread } from '../utils/unread';
import { NULL_MESSAGE, NULL_USER, NULL_SUBSCRIPTION } from '../nullObjects';

const privateNarrowStr = JSON.stringify(specialNarrow('private'));

export const getIsFetching = (state: GlobalState): boolean =>
  (state.app.needsInitialFetch && state.chat.fetchingOlder) || state.chat.fetchingOlder;

export const getActiveNarrowString = (state: GlobalState): string =>
  JSON.stringify(state.chat.narrow);

export const getPrivateNarrowString = (state: GlobalState): string =>
  JSON.stringify(state.chat.narrow);

export const getMessagesInActiveNarrow = createSelector(
  getAllMessages,
  getActiveNarrowString,
  (allMessages, activeNarrowString) => allMessages[activeNarrowString] || [],
);

export const getShownMessagesInActiveNarrow = createSelector(
  getMessagesInActiveNarrow,
  getActiveNarrow,
  getSubscriptions,
  getMute,
  (messagesInActiveNarrow, activeNarrow, subscriptions, mute) =>
    messagesInActiveNarrow.filter(item => !shouldBeMuted(item, activeNarrow, subscriptions, mute)),
);

export const getAnchor = createSelector(getMessagesInActiveNarrow, messages => {
  if (messages.length === 0) {
    return undefined;
  }

  return {
    older: messages[0].id,
    newer: messages[messages.length - 1].id,
  };
});

export const getPrivateMessages = createSelector(
  getAllMessages,
  messages => messages[privateNarrowStr] || [],
);

export const getRecentConversations = createSelector(
  getOwnEmail,
  getPrivateMessages,
  getReadFlags,
  (ownEmail, messages, read) => {
    const recipients = messages.map(msg => ({
      emails: normalizeRecipientsSansMe(msg.display_recipient, ownEmail),
      timestamp: msg.timestamp,
      isRead: read[msg.id] || 0,
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
    return Array.from(groupedRecipients.values()).sort((a, b) => +b.timestamp - +a.timestamp);
  },
);

export const getUnreadPrivateMessagesCount = createSelector(
  getPrivateMessages,
  getReadFlags,
  (privateMessages, readFlags) => countUnread(privateMessages.map(msg => msg.id), readFlags),
);

export const getCurrentTypingUsers = createSelector(
  getActiveNarrow,
  getTyping,
  getUsers,
  getOwnEmail,
  (activeNarrow, typing, users, ownEmail) => {
    if (!isPrivateOrGroupNarrow(activeNarrow)) {
      return undefined;
    }

    const recipients = activeNarrow[0].operand.split(',').map(email => ({ email }));
    const normalizedRecipients = normalizeRecipients(recipients);
    const currentTyping = typing[normalizedRecipients];

    if (!currentTyping) {
      return undefined;
    }

    return currentTyping.map(userId => getUserById(users, userId));
  },
);

export const getLastTopicInActiveNarrow = createSelector(
  getMessagesInActiveNarrow,
  messagesInActiveNarrow => {
    const reversedMessages = messagesInActiveNarrow.slice().reverse();
    const lastMessageWithSubject = reversedMessages.find(msg => msg.subject) || NULL_MESSAGE;
    return lastMessageWithSubject.subject;
  },
);

export const getUserInPmNarrow = createSelector(
  getActiveNarrow,
  getUsers,
  (narrow, users) => users.find(x => x.email === narrow[0].operand) || NULL_USER,
);

export const getRecipientsInGroupNarrow = createSelector(
  getActiveNarrow,
  getUsers,
  (narrow, users) => narrow[0].operand.split(',').map(r => users.find(x => x.email === r) || []),
);

export const getStreamInNarrow = createSelector(
  getActiveNarrow,
  getSubscriptions,
  getStreams,
  (narrow, subscriptions, streams) =>
    subscriptions.find(x => x.name === narrow[0].operand) || {
      ...streams.find(x => x.name === narrow[0].operand),
      in_home_view: true,
    } ||
    NULL_SUBSCRIPTION,
);
