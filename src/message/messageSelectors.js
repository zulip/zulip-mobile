/* @flow strict-local */
import { createSelector, defaultMemoize } from 'reselect';
import invariant from 'invariant';

import type { Message, PmMessage, Outbox, Narrow, Selector, MessageListElement } from '../types';
import {
  getAllNarrows,
  getFlags,
  getMessages,
  getMute,
  getSubscriptions,
} from '../directSelectors';
import * as logging from '../utils/logging';
import { getShownMessagesForNarrow } from '../chat/narrowsSelectors';
import getMessageListElements from './getMessageListElements';
import type { JSONable } from '../utils/jsonable';
import { ALL_PRIVATE_NARROW_STR } from '../utils/narrow';
import { NULL_ARRAY } from '../nullObjects';

/**
 * Truncate a potentially-very-long array for logging and/or reporting purposes.
 * Returns something which may or may not be an array, but is at least JSONable
 * and human-readable.
 */
function truncateForLogging<T: JSONable>(arr: $ReadOnlyArray<T>, len = 10): JSONable {
  if (arr.length <= 2 * len) {
    return arr;
  }
  return {
    length: arr.length,
    start: arr.slice(0, len),
    end: arr.slice(-len),
  };
}

export const getPrivateMessages: Selector<PmMessage[]> = createSelector(
  getAllNarrows,
  getMessages,
  (narrows, messages) => {
    const privateMessages: PmMessage[] = [];
    const unknownIds: number[] = [];

    const pmIds = narrows.get(ALL_PRIVATE_NARROW_STR) || NULL_ARRAY;
    pmIds.forEach(id => {
      const msg = messages.get(id);
      if (msg !== undefined) {
        // It seems like the code involved in maintaining this invariant
        // extends to the server: we go and make a fetch for this narrow,
        // and then whatever the server gives us gets put here, and we don't
        // seem to try to verify that as it goes in. So in fact ideally this
        // check would be at a crunchy shell. But getting that wrong is a
        // pretty unlikely bug for the server to have, so just doing
        // `invariant` here is fine.
        invariant(msg.type === 'private', 'msg is a PM');

        privateMessages.push(msg);
      } else {
        unknownIds.push(id);
      }
    });

    // BUG (#3749): all messages in `narrows` _should_ also be in `messages`.
    // Error reports indicate that, somehow, this isn't always so.
    if (unknownIds.length > 0) {
      logging.error('narrow IDs not found in state.messages', {
        all_ids: truncateForLogging(pmIds),
        unknown_ids: truncateForLogging(unknownIds),
      });
    }
    return privateMessages;
  },
);

export const getMessageListElementsMemoized: (
  $ReadOnlyArray<Message | Outbox>,
  Narrow,
) => $ReadOnlyArray<MessageListElement> = defaultMemoize(getMessageListElements);

export const getFirstUnreadIdInNarrow: Selector<number | null, Narrow> = createSelector(
  (state, narrow) => getShownMessagesForNarrow(state, narrow),
  getFlags,
  getSubscriptions,
  getMute,
  (messages, flags, subscriptions, mute) => {
    const firstUnread = messages.find(msg => !flags.read[msg.id]);
    return firstUnread?.id ?? null;
  },
);
