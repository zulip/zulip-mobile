/* @flow */
import { createSelector } from 'reselect';

import type { Narrow } from '../types';
import {
  getAllMessages,
  getSubscriptions,
  getMute,
  getStreams,
  getOutbox,
} from '../directSelectors';
import { getCaughtUpForActiveNarrow } from '../caughtup/caughtUpSelectors';
import { getAllUsersAndBots } from '../users/userSelectors';
import { getIsFetching } from './fetchingSelectors';
import {
  isAllPrivateNarrow,
  isPrivateOrGroupNarrow,
  isStreamNarrow,
  isHomeNarrow,
  isPrivateNarrow,
  canSendToNarrow,
  isStreamOrTopicNarrow,
} from '../utils/narrow';
import { shouldBeMuted } from '../utils/message';
import { NULL_ARRAY, NULL_MESSAGE, NULL_USER, NULL_SUBSCRIPTION } from '../nullObjects';

export const outboxMessagesForCurrentNarrow = (narrow: Narrow) =>
  createSelector(getCaughtUpForActiveNarrow(narrow), getOutbox, (caughtUp, outboxMessages) => {
    if (!caughtUp.newer) {
      return [];
    }

    if (isHomeNarrow(narrow)) {
      return outboxMessages;
    }

    return outboxMessages.filter(item => {
      if (isAllPrivateNarrow(narrow) && isPrivateOrGroupNarrow(item.narrow)) {
        return true;
      }
      if (isStreamNarrow(narrow) && item.narrow[0].operand === narrow[0].operand) {
        return true;
      }
      return JSON.stringify(item.narrow) === JSON.stringify(narrow);
    });
  });

export const getFetchedMessagesForNarrow = (narrow: Narrow) =>
  createSelector(getAllMessages, allMessages => allMessages[JSON.stringify(narrow)] || NULL_ARRAY);

export const getMessagesForNarrow = (narrow: Narrow) =>
  createSelector(
    getFetchedMessagesForNarrow(narrow),
    outboxMessagesForCurrentNarrow(narrow),
    (fetchedMessages, outboxMessages) => {
      if (outboxMessages.length === 0) {
        return fetchedMessages;
      }

      return [...fetchedMessages, ...outboxMessages].sort((a, b) => a.id - b.id);
    },
  );

export const getShownMessagesForNarrow = (narrow: Narrow) =>
  createSelector(
    getMessagesForNarrow(narrow),
    getSubscriptions,
    getMute,
    (messagesForNarrow, subscriptions, mute) =>
      messagesForNarrow.filter(item => !shouldBeMuted(item, narrow, subscriptions, mute)),
  );

export const getFirstMessageId = (narrow: Narrow) =>
  createSelector(
    getFetchedMessagesForNarrow(narrow),
    messages => (messages.length > 0 ? messages[0].id : undefined),
  );

export const getLastMessageId = (narrow: Narrow) =>
  createSelector(
    getFetchedMessagesForNarrow(narrow),
    messages => (messages.length > 0 ? messages[messages.length - 1].id : undefined),
  );

export const getLastTopicForNarrow = (narrow: Narrow) =>
  createSelector(getMessagesForNarrow(narrow), messagesForNarrow => {
    const reversedMessages = messagesForNarrow.slice().reverse();
    const lastMessageWithSubject = reversedMessages.find(msg => msg.subject) || NULL_MESSAGE;
    return lastMessageWithSubject.subject;
  });

export const getUserInPmNarrow = (narrow: Narrow) =>
  createSelector(
    getAllUsersAndBots,
    allUsersAndBots => allUsersAndBots.find(x => x.email === narrow[0].operand) || NULL_USER,
  );

export const getRecipientsInGroupNarrow = (narrow: Narrow) =>
  createSelector(
    getAllUsersAndBots,
    allUsersAndBots =>
      !narrow || narrow.length === 0
        ? []
        : narrow[0].operand.split(',').map(r => allUsersAndBots.find(x => x.email === r) || []),
  );

export const getStreamInNarrow = (narrow: Narrow) =>
  createSelector(getSubscriptions, getStreams, (subscriptions, streams) => {
    if (!isStreamOrTopicNarrow(narrow)) {
      return NULL_SUBSCRIPTION;
    }

    const subscription = subscriptions.find(x => x.name === narrow[0].operand);
    if (subscription) {
      return subscription;
    }

    const stream = streams.find(x => x.name === narrow[0].operand);
    if (stream) {
      return {
        ...stream,
        in_home_view: true,
      };
    }

    return NULL_SUBSCRIPTION;
  });

export const getIfNoMessages = (narrow: Narrow) =>
  createSelector(getShownMessagesForNarrow(narrow), messages => messages && messages.length === 0);

export const getShowMessagePlaceholders = (narrow: Narrow) =>
  createSelector(
    getIfNoMessages(narrow),
    getIsFetching(narrow),
    (noMessages, isFetching) => isFetching && noMessages,
  );

export const canSendToActiveNarrow = (narrow: Narrow) => canSendToNarrow(narrow);

export const isNarrowValid = (narrow: Narrow) =>
  createSelector(getStreams, getAllUsersAndBots, (streams, allUsersAndBots) => {
    if (isStreamOrTopicNarrow(narrow)) {
      return streams.find(s => s.name === narrow[0].operand) !== undefined;
    }

    if (isPrivateNarrow(narrow)) {
      return allUsersAndBots.find(u => u.email === narrow[0].operand) !== undefined;
    }

    return true;
  });
