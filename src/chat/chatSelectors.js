/* @flow */
import { createSelector } from 'reselect';

import type { GlobalState } from '../types';
import {
  getAllMessages,
  getSubscriptions,
  getActiveNarrow,
  getMute,
  getUsers,
  getReadFlags,
  getStreams,
} from '../baseSelectors';
import { specialNarrow } from '../utils/narrow';
import { shouldBeMuted } from '../utils/message';
import { countUnread } from '../utils/unread';
import { NULL_MESSAGE, NULL_USER, NULL_SUBSCRIPTION } from '../nullObjects';

const privateNarrowStr = JSON.stringify(specialNarrow('private'));

export const getIsFetching = (state: GlobalState): boolean =>
  (state.app.needsInitialFetch && state.chat.fetchingOlder) || state.chat.fetchingOlder;

export const getActiveNarrowString = (state: GlobalState): string =>
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
