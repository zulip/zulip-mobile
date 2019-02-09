/* @flow strict-local */
import { createSelector } from 'reselect';

import type { Message, Narrow, Outbox, Selector } from '../types';
import {
  getAllNarrows,
  getSubscriptions,
  getMessages,
  getMute,
  getStreams,
  getOutbox,
} from '../directSelectors';
import { getCaughtUpForActiveNarrow } from '../caughtup/caughtUpSelectors';
import { getAllUsers } from '../users/userSelectors';
import { getIsFetching } from './fetchingSelectors';
import {
  isAllPrivateNarrow,
  isPrivateOrGroupNarrow,
  isStreamNarrow,
  isHomeNarrow,
  isPrivateNarrow,
  isStreamOrTopicNarrow,
  emailsOfGroupNarrow,
} from '../utils/narrow';
import { shouldBeMuted } from '../utils/message';
import { NULL_ARRAY, NULL_SUBSCRIPTION } from '../nullObjects';

export const outboxMessagesForCurrentNarrow = (narrow: Narrow): Selector<Outbox[]> =>
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

export const getFetchedMessagesForNarrow = (narrow: Narrow): Selector<Message[]> =>
  createSelector(getAllNarrows, getMessages, (allNarrows, messages) =>
    (allNarrows[JSON.stringify(narrow)] || NULL_ARRAY).map(id => messages[id]),
  );

export const getMessagesForNarrow = (narrow: Narrow): Selector<$ReadOnlyArray<Message | Outbox>> =>
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

export const getShownMessagesForNarrow = (
  narrow: Narrow,
): Selector<$ReadOnlyArray<Message | Outbox>> =>
  createSelector(
    getMessagesForNarrow(narrow),
    getSubscriptions,
    getMute,
    (messagesForNarrow, subscriptions, mute) =>
      messagesForNarrow.filter(item => !shouldBeMuted(item, narrow, subscriptions, mute)),
  );

export const getFirstMessageId = (narrow: Narrow): Selector<?number> =>
  createSelector(
    getFetchedMessagesForNarrow(narrow),
    messages => (messages.length > 0 ? messages[0].id : undefined),
  );

export const getLastMessageId = (narrow: Narrow): Selector<?number> =>
  createSelector(
    getFetchedMessagesForNarrow(narrow),
    messages => (messages.length > 0 ? messages[messages.length - 1].id : undefined),
  );

export const getLastTopicForNarrow = (narrow: Narrow): Selector<string> =>
  createSelector(getMessagesForNarrow(narrow), messages => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].subject) {
        return messages[i].subject;
      }
    }
    return '';
  });

export const getRecipientsInGroupNarrow = (narrow: Narrow) =>
  createSelector(getAllUsers, allUsers =>
    emailsOfGroupNarrow(narrow).map(r => allUsers.find(x => x.email === r) || []),
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

export const isNarrowValid = (narrow: Narrow) =>
  createSelector(getStreams, getAllUsers, (streams, allUsers) => {
    if (isStreamOrTopicNarrow(narrow)) {
      return streams.find(s => s.name === narrow[0].operand) !== undefined;
    }

    if (isPrivateNarrow(narrow)) {
      return allUsers.find(u => u.email === narrow[0].operand) !== undefined;
    }

    return true;
  });
