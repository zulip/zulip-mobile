/* @flow */
import { createSelector } from 'reselect';

import {
  getAllMessages,
  getSubscriptions,
  getActiveNarrow,
  getMute,
  getUsers,
  getReadFlags,
  getStreams,
  getOutbox,
} from '../baseSelectors';
import {
  isAllPrivateNarrow,
  isPrivateOrGroupNarrow,
  isStreamNarrow,
  isHomeNarrow,
  homeNarrow,
  allPrivateNarrowStr,
  canSendToNarrow,
} from '../utils/narrow';
import { shouldBeMuted } from '../utils/message';
import { countUnread } from '../utils/unread';
import { NULL_MESSAGE, NULL_USER, NULL_SUBSCRIPTION } from '../nullObjects';

const getMessagesFromChatState = state =>
  state.messages[JSON.stringify(state.narrow || homeNarrow)] || [];

export const getMessagesInActiveNarrow = createSelector(
  getAllMessages,
  getActiveNarrow,
  getOutbox,
  (allMessages, narrow, outboxMessages) => {
    const activeNarrowString = JSON.stringify(narrow);

    if (!allMessages[activeNarrowString]) return [];
    const outboxMessagesForCurrentNarrow = isHomeNarrow(narrow)
      ? outboxMessages
      : outboxMessages.filter(item => {
          if (isAllPrivateNarrow(narrow) && isPrivateOrGroupNarrow(item.narrow)) return true;
          if (isStreamNarrow(narrow) && item.narrow[0].operand === narrow[0].operand) return true;
          return JSON.stringify(item.narrow) === activeNarrowString;
        });

    // TODO make this more efficient
    if (!outboxMessagesForCurrentNarrow) return allMessages[activeNarrowString];
    return allMessages[activeNarrowString]
      .concat(outboxMessagesForCurrentNarrow)
      .sort((a, b) => a.timestamp - b.timestamp);
  },
);

export const getShownMessagesInActiveNarrow = createSelector(
  getMessagesInActiveNarrow,
  getActiveNarrow,
  getSubscriptions,
  getMute,
  (messagesInActiveNarrow, activeNarrow, subscriptions, mute) =>
    messagesInActiveNarrow.filter(item => !shouldBeMuted(item, activeNarrow, subscriptions, mute)),
);

export const getFetchedMessagesInActiveNarrow = createSelector(
  getAllMessages,
  getActiveNarrow,
  (allMessages, activeNarrow) => allMessages[JSON.stringify(activeNarrow)] || [],
);

export const getFirstMessageId = createSelector(
  getFetchedMessagesInActiveNarrow,
  messages => (messages.length > 0 ? messages[0].id : undefined),
);

export const getLastMessageId = createSelector(
  getFetchedMessagesInActiveNarrow,
  messages => (messages.length > 0 ? messages[messages.length - 1].id : undefined),
);

export const getPrivateMessages = createSelector(
  getAllMessages,
  messages => messages[allPrivateNarrowStr] || [],
);

export const getUnreadPrivateMessagesCount = createSelector(
  getPrivateMessages,
  getReadFlags,
  (privateMessages, readFlags) => countUnread(privateMessages.map(msg => msg.id), readFlags),
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

export const getUnreadCountInActiveNarrow = createSelector(
  getShownMessagesInActiveNarrow,
  getReadFlags,
  (shownMessagesInActiveNarrow, readIds) =>
    countUnread(shownMessagesInActiveNarrow.map(msg => msg.id), readIds),
);

export const getIfNoMessages = createSelector(
  getShownMessagesInActiveNarrow,
  messages => messages && messages.length === 0,
);

export const getMessagesById = createSelector(getMessagesFromChatState, messages =>
  messages.reduce((msgById, message) => {
    msgById[message.id] = message;
    return msgById;
  }, {}),
);

export const canSendToActiveNarrow = createSelector(getActiveNarrow, narrow =>
  canSendToNarrow(narrow),
);
