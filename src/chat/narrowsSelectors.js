/* @flow strict-local */
import isEqual from 'lodash.isequal';
import { createSelector } from 'reselect';
import type { OutputSelector } from 'reselect';

import type { GlobalState, Message, Narrow, Outbox, Selector } from '../types';
import {
  getAllNarrows,
  getSubscriptions,
  getMessages,
  getMute,
  getStreams,
  getOutbox,
} from '../directSelectors';
import { getCaughtUpForNarrow } from '../caughtup/caughtUpSelectors';
import { getAllUsers } from '../users/userSelectors';
import { getIsFetching } from './fetchingSelectors';
import {
  isPrivateNarrow,
  isStreamOrTopicNarrow,
  emailsOfGroupNarrow,
  narrowContains,
} from '../utils/narrow';
import { shouldBeMuted } from '../utils/message';
import { NULL_ARRAY, NULL_SUBSCRIPTION } from '../nullObjects';

// prettier-ignore
export const outboxMessagesForNarrow:
    OutputSelector<GlobalState, Narrow, Outbox[]> = createSelector(
  (state, narrow) => narrow,
  getCaughtUpForNarrow,
  state => getOutbox(state),
  (narrow, caughtUp, outboxMessages) => {
    if (!caughtUp.newer) {
      return NULL_ARRAY;
    }
    const filtered = outboxMessages.filter(item => narrowContains(narrow, item.narrow));
    return isEqual(filtered, outboxMessages) ? outboxMessages : filtered;
  },
);

export const getFetchedMessageIdsForNarrow = (state: GlobalState, narrow: Narrow) =>
  getAllNarrows(state)[JSON.stringify(narrow)] || NULL_ARRAY;

const getFetchedMessagesForNarrow = (narrow: Narrow): Selector<Message[]> =>
  createSelector(
    state => getFetchedMessageIdsForNarrow(state, narrow),
    getMessages,
    (messageIds, messages) => messageIds.map(id => messages[id]),
  );

export const getMessagesForNarrow = (narrow: Narrow): Selector<$ReadOnlyArray<Message | Outbox>> =>
  createSelector(
    getFetchedMessagesForNarrow(narrow),
    state => outboxMessagesForNarrow(state, narrow),
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
