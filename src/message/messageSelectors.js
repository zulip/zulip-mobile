/* @flow strict-local */
import { createSelector, defaultMemoize } from 'reselect';

import type { Message, Outbox, Narrow, Selector, HtmlPieceDescriptor } from '../types';
import {
  getAllNarrows,
  getFlags,
  getMessages,
  getMute,
  getSubscriptions,
} from '../directSelectors';
import * as logging from '../utils/logging';
import { getShownMessagesForNarrow } from '../chat/narrowsSelectors';
import getHtmlPieceDescriptors from './getHtmlPieceDescriptors';
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

export const getPrivateMessages: Selector<Message[]> = createSelector(
  getAllNarrows,
  getMessages,
  (narrows, messages) => {
    const privateMessages: Message[] = [];
    const unknownIds: number[] = [];

    const pmIds = narrows.get(ALL_PRIVATE_NARROW_STR) || NULL_ARRAY;
    pmIds.forEach(id => {
      const msg = messages.get(id);
      if (msg !== undefined) {
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

export const getHtmlPieceDescriptorsMemoized: (
  $ReadOnlyArray<Message | Outbox>,
  Narrow,
) => $ReadOnlyArray<HtmlPieceDescriptor> = defaultMemoize(getHtmlPieceDescriptors);

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
