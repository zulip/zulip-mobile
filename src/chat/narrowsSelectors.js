/* @flow strict-local */
// $FlowFixMe[untyped-import]
import isEqual from 'lodash.isequal';
import { createSelector } from 'reselect';

import type {
  GlobalState,
  Message,
  MuteState,
  Narrow,
  Outbox,
  Selector,
  Stream,
  Subscription,
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
import { getAllUsersById, getOwnUserId } from '../users/userSelectors';
import {
  isStreamOrTopicNarrow,
  isHomeNarrow,
  isTopicNarrow,
  isMentionedNarrow,
  isMessageInNarrow,
  caseNarrowDefault,
  keyFromNarrow,
  streamNameOfNarrow,
} from '../utils/narrow';
import { isTopicMuted } from '../mute/muteModel';
import { streamNameOfStreamMessage } from '../utils/recipient';
import { NULL_ARRAY, NULL_SUBSCRIPTION } from '../nullObjects';
import * as logging from '../utils/logging';

export const outboxMessagesForNarrow: Selector<$ReadOnlyArray<Outbox>, Narrow> = createSelector(
  (state, narrow) => narrow,
  getCaughtUpForNarrow,
  state => getOutbox(state),
  getOwnUserId,
  (narrow, caughtUp, outboxMessages, ownUserId) => {
    if (!caughtUp.newer) {
      return NULL_ARRAY;
    }
    // TODO?: Handle @-mention flags in outbox messages.  As is, if you
    //   @-mention yourself (or a wildcard) and then go look at the
    //   is:mentioned view while your message is still unsent, we wrongly
    //   leave it out.  Pretty uncommon edge case, though.
    //
    // No other narrows rely on flags except the "starred" narrow.  Outbox
    // messages can't be starred, so "no flags" gives that the right answer.
    const fakeFlags = [];
    const filtered = outboxMessages.filter(message =>
      isMessageInNarrow(message, fakeFlags, narrow, ownUserId),
    );
    return isEqual(filtered, outboxMessages) ? outboxMessages : filtered;
  },
);

export const getFetchedMessageIdsForNarrow = (
  state: GlobalState,
  narrow: Narrow,
): $ReadOnlyArray<number> => getAllNarrows(state).get(keyFromNarrow(narrow)) || NULL_ARRAY;

const getFetchedMessagesForNarrow: Selector<Message[], Narrow> = createSelector(
  getFetchedMessageIdsForNarrow,
  state => getMessages(state),
  (messageIds, messages) =>
    messageIds.map(id => {
      const message = messages.get(id);
      if (!message) {
        const msg = 'getFetchedMessagesForNarrow: message with id is missing in getMessages(state)';
        logging.error(msg, { id });
        throw new Error(msg);
      }
      return message;
    }),
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

const shouldBeMuted = (
  message: Message | Outbox,
  narrow: Narrow,
  subscriptions: $ReadOnlyArray<Subscription>,
  mutes: MuteState,
): boolean => {
  if (message.type === 'private') {
    // When viewing a topic narrow, we show all the messages even if the
    // topic or stream is muted.
    return false;
  }

  if (isTopicNarrow(narrow)) {
    return false; // never hide a message when narrowed to topic
  }

  // This logic isn't quite right - we want to make sure we never hide a
  // message that has a mention, even if we aren't in the "Mentioned"
  // narrow. (#3472)  However, it's more complex to do that, and this code
  // fixes the largest problem we'd had with muted mentioned messages, which
  // is that they show up in the count for the "Mentions" tab, but without
  // this conditional they wouldn't in the actual narrow.
  if (isMentionedNarrow(narrow)) {
    return false;
  }

  const streamName = streamNameOfStreamMessage(message);

  if (isHomeNarrow(narrow)) {
    const sub = subscriptions.find(x => x.name === streamName);
    if (!sub) {
      // If there's no matching subscription, then the user must have
      // unsubscribed from the stream since the message was received.  Leave
      // those messages out of this view, just like for a muted stream.
      return true;
    }
    if (!sub.in_home_view) {
      return true;
    }
  }

  return isTopicMuted(streamName, message.subject, mutes);
};

/**
 * The known messages that should appear in the given narrow's message list.
 *
 * This is like {@link getMessagesForNarrow} but returns a subset of the
 * messages, to implement the muted-stream and muted-topic features.
 */
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

// Prettier mishandles this Flow syntax.
// prettier-ignore
// TODO: clean up what this returns; possibly to just `Stream`
export const getStreamInNarrow: Selector<Subscription | {| ...Stream, in_home_view: boolean |}, Narrow> = createSelector(
  (state, narrow) => narrow,
  state => getSubscriptions(state),
  state => getStreams(state),
  (narrow, subscriptions, streams) => {
    if (!isStreamOrTopicNarrow(narrow)) {
      return NULL_SUBSCRIPTION;
    }
    const streamName = streamNameOfNarrow(narrow);

    const subscription = subscriptions.find(x => x.name === streamName);
    if (subscription) {
      return subscription;
    }

    const stream = streams.find(x => x.name === streamName);
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
  state => getAllUsersById(state),
  (narrow, streams, allUsersById) =>
    caseNarrowDefault(
      narrow,
      {
        stream: streamName => streams.find(s => s.name === streamName) !== undefined,
        topic: streamName => streams.find(s => s.name === streamName) !== undefined,
        pm: ids => ids.every(id => allUsersById.get(id) !== undefined),
      },
      () => true,
    ),
);
