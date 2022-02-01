/* @flow strict-local */
// $FlowFixMe[untyped-import]
import isEqual from 'lodash.isequal';
import { createSelector } from 'reselect';

import type {
  PerAccountState,
  Message,
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
  getOutbox,
  getFlags,
} from '../directSelectors';
import { getCaughtUpForNarrow } from '../caughtup/caughtUpSelectors';
import { getAllUsersById, getOwnUserId } from '../users/userSelectors';
import {
  isStreamOrTopicNarrow,
  isMessageInNarrow,
  caseNarrowDefault,
  keyFromNarrow,
  caseNarrow,
  streamIdOfNarrow,
} from '../utils/narrow';
import { getMute, isTopicMuted } from '../mute/muteModel';
import { streamNameOfStreamMessage } from '../utils/recipient';
import { NULL_ARRAY, NULL_SUBSCRIPTION } from '../nullObjects';
import * as logging from '../utils/logging';
import { getStreamsById, getSubscriptionsById } from '../selectors';

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
  state: PerAccountState,
  narrow: Narrow,
): $ReadOnlyArray<number> => getAllNarrows(state).get(keyFromNarrow(narrow)) || NULL_ARRAY;

const getFetchedMessagesForNarrow: Selector<$ReadOnlyArray<Message>, Narrow> = createSelector(
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

/** Whether this stream's messages should appear in the "all messages" narrow. */
const showStreamInHomeNarrow = (
  streamName: string,
  subscriptions: $ReadOnlyArray<Subscription>,
): boolean => {
  const sub = subscriptions.find(x => x.name === streamName);
  if (!sub) {
    // If there's no matching subscription, then the user must have
    // unsubscribed from the stream since the message was received.  Leave
    // those messages out of this view, just like for a muted stream.
    return false;
  }

  return sub.in_home_view;
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
    state => getFlags(state),
    (narrow, messagesForNarrow, subscriptions, mute, flags) =>
      caseNarrow(narrow, {
        home: _ =>
          messagesForNarrow.filter(message => {
            if (message.type === 'private') {
              return true;
            }
            if (flags.mentioned[message.id]) {
              return true;
            }
            const streamName = streamNameOfStreamMessage(message);
            return (
              showStreamInHomeNarrow(streamName, subscriptions)
              && !isTopicMuted(streamName, message.subject, mute)
            );
          }),

        stream: _ =>
          messagesForNarrow.filter(message => {
            if (message.type === 'private') {
              return true;
            }
            if (flags.mentioned[message.id]) {
              return true;
            }
            const streamName = streamNameOfStreamMessage(message);
            return !isTopicMuted(streamName, message.subject, mute);
          }),

        // In the starred-message view, ignore stream/topic mutes.
        // TODO: What about starred messages in other views?
        starred: _ => messagesForNarrow,

        // When viewing a topic narrow, we show all the messages even if the
        // topic or stream is muted.
        topic: _ => messagesForNarrow,

        // In a PM narrow, no messages can be in a muted stream or topic.
        pm: _ => messagesForNarrow,

        // In the @-mentions narrow, all messages are mentions, which we
        // always show despite stream or topic mutes.
        mentioned: _ => messagesForNarrow,

        // The all-PMs narrow doesn't matter here, because we don't offer a
        // message list for it in the UI.  (It exists for the sake of
        // `getRecentConversationsLegacy`.)
        allPrivate: _ => messagesForNarrow,

        // Search narrows don't matter here, because we never reach this code
        // when searching (we don't get the messages from Redux.)
        search: _ => messagesForNarrow,
      }),
);

export const getFirstMessageId = (state: PerAccountState, narrow: Narrow): number | void => {
  const ids = getFetchedMessageIdsForNarrow(state, narrow);
  return ids.length > 0 ? ids[0] : undefined;
};

export const getLastMessageId = (state: PerAccountState, narrow: Narrow): number | void => {
  const ids = getFetchedMessageIdsForNarrow(state, narrow);
  return ids.length > 0 ? ids[ids.length - 1] : undefined;
};

// Prettier mishandles this Flow syntax.
// prettier-ignore
// TODO: clean up what this returns; possibly to just `Stream`
export const getStreamInNarrow: Selector<Subscription | {| ...Stream, in_home_view: boolean |}, Narrow> = createSelector(
  (state, narrow) => narrow,
  state => getSubscriptionsById(state),
  state => getStreamsById(state),
  (narrow, subscriptions, streams) => {
    if (!isStreamOrTopicNarrow(narrow)) {
      return NULL_SUBSCRIPTION;
    }
    const streamId = streamIdOfNarrow(narrow);

    const subscription = subscriptions.get(streamId);
    if (subscription) {
      return subscription;
    }

    const stream = streams.get(streamId);
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
  state => getStreamsById(state),
  state => getAllUsersById(state),
  (narrow, streams, allUsersById) =>
    caseNarrowDefault(
      narrow,
      {
        stream: streamId => streams.get(streamId) !== undefined,
        topic: streamId => streams.get(streamId) !== undefined,
        pm: ids => ids.every(id => allUsersById.get(id) !== undefined),
      },
      () => true,
    ),
);
