/* @flow strict-local */
import isEqual from 'lodash.isequal';
import { createSelector } from 'reselect';

import type {
  GlobalState,
  Message,
  Narrow,
  Outbox,
  Selector,
  Stream,
  Subscription,
  UserOrBot,
} from '../types';
import {
  getAllNarrows,
  getSubscriptions,
  getMessages,
  getMute,
  getStreams,
  getOutbox,
} from '../directSelectors';
import { getCaughtUpForNarrow } from '../caughtup/caughtUpSelectors';
import { getAllUsersByEmail } from '../users/userSelectors';
import {
  isPrivateNarrow,
  isStreamOrTopicNarrow,
  emailsOfGroupNarrow,
  narrowContainsOutbox,
} from '../utils/narrow';
import { shouldBeMuted } from '../utils/message';
import { NULL_ARRAY, NULL_SUBSCRIPTION } from '../nullObjects';

export const outboxMessagesForNarrow: Selector<Outbox[], Narrow> = createSelector(
  (state, narrow) => narrow,
  getCaughtUpForNarrow,
  state => getOutbox(state),
  (narrow, caughtUp, outboxMessages) => {
    if (!caughtUp.newer) {
      return NULL_ARRAY;
    }
    const filtered = outboxMessages.filter(item => narrowContainsOutbox(narrow, item));
    return isEqual(filtered, outboxMessages) ? outboxMessages : filtered;
  },
);

export const getFetchedMessageIdsForNarrow = (state: GlobalState, narrow: Narrow) =>
  getAllNarrows(state)[JSON.stringify(narrow)] || NULL_ARRAY;

const getFetchedMessagesForNarrow: Selector<Message[], Narrow> = createSelector(
  getFetchedMessageIdsForNarrow,
  state => getMessages(state),
  (messageIds, messages) => messageIds.map(id => messages[id]),
);

// Prettier mishandles this Flow syntax.
// prettier-ignore
export const getMessagesForNarrow: Selector<$ReadOnlyArray<Message | Outbox>, Narrow> =
  createSelector(
    getFetchedMessagesForNarrow,
    outboxMessagesForNarrow,
    (fetchedMessages, outboxMessages) => {
      if (outboxMessages.length === 0) {
        return fetchedMessages;
      }

      return [...fetchedMessages, ...outboxMessages].sort((a, b) => a.id - b.id);
    },
  );

// Prettier mishandles this Flow syntax.
// prettier-ignore
export const getShownMessagesForNarrow: Selector<$ReadOnlyArray<Message | Outbox>, Narrow> =
  createSelector(
    (state, narrow) => narrow,
    getMessagesForNarrow,
    state => getSubscriptions(state),
    state => getMute(state),
    (narrow, messagesForNarrow, subscriptions, mute) =>
      messagesForNarrow.filter(item => !shouldBeMuted(item, narrow, subscriptions, mute)),
  );

export const getFirstMessageId = (state: GlobalState, narrow: Narrow): number | void => {
  const ids = getFetchedMessageIdsForNarrow(state, narrow);
  return ids.length > 0 ? ids[0] : undefined;
};

export const getLastMessageId = (state: GlobalState, narrow: Narrow): number | void => {
  const ids = getFetchedMessageIdsForNarrow(state, narrow);
  return ids.length > 0 ? ids[ids.length - 1] : undefined;
};

export const getRecipientsInGroupNarrow: Selector<UserOrBot[], Narrow> = createSelector(
  (state, narrow) => narrow,
  state => getAllUsersByEmail(state),
  (narrow, allUsersByEmail) =>
    emailsOfGroupNarrow(narrow).map(r => {
      const user = allUsersByEmail.get(r);
      if (user === undefined) {
        throw new Error(`missing user: ${r}`);
      }
      return user;
    }),
);

// Prettier mishandles this Flow syntax.
// prettier-ignore
// TODO: clean up what this returns.
export const getStreamInNarrow: Selector<Subscription | {| ...Stream, in_home_view: boolean |}, Narrow> = createSelector(
  (state, narrow) => narrow,
  state => getSubscriptions(state),
  state => getStreams(state),
  (narrow, subscriptions, streams) => {
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
  },
);

export const isNarrowValid: Selector<boolean, Narrow> = createSelector(
  (state, narrow) => narrow,
  state => getStreams(state),
  state => getAllUsersByEmail(state),
  (narrow, streams, allUsersByEmail) => {
    if (isStreamOrTopicNarrow(narrow)) {
      return streams.find(s => s.name === narrow[0].operand) !== undefined;
    }

    if (isPrivateNarrow(narrow)) {
      return allUsersByEmail.get(narrow[0].operand) !== undefined;
    }

    return true;
  },
);
