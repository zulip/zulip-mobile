/* @flow strict-local */
import { createSelector } from 'reselect';

import type { Message, Narrow, RenderedSectionDescriptor, Selector } from '../types';
import {
  getAllNarrows,
  getFlags,
  getMessages,
  getMute,
  getSubscriptions,
} from '../directSelectors';
import * as logging from '../utils/logging';
import { getShownMessagesForNarrow } from '../chat/narrowsSelectors';
import renderMessages from './renderMessages';
import { findAnchor } from '../utils/message';
import type { JSONable } from '../utils/jsonable';
import { ALL_PRIVATE_NARROW_STR } from '../utils/narrow';
import { NULL_ARRAY } from '../nullObjects';

/**
 * Truncate a potentially-very-long array for logging and/or reporting purposes.
 * Returns something which may or may not be an array, but is at least JSONable
 * and human-readable.
 */
function truncateForLogging<T: JSONable>(arr: Array<T>, len = 10): JSONable {
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

    const pmIds = narrows[ALL_PRIVATE_NARROW_STR] || NULL_ARRAY;
    pmIds.forEach(id => {
      const msg = messages[id];
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
        unknown_ids: unknownIds,
      });
    }
    return privateMessages;
  },
);

export const getRenderedMessages = (narrow: Narrow): Selector<RenderedSectionDescriptor[]> =>
  createSelector(
    state => getShownMessagesForNarrow(state, narrow),
    messages => renderMessages(messages, narrow),
  );

export const getAnchorForNarrow = (narrow: Narrow): Selector<number> =>
  createSelector(
    state => getShownMessagesForNarrow(state, narrow),
    getFlags,
    getSubscriptions,
    getMute,
    (messages, flags, subscriptions, mute) => findAnchor(messages, flags, subscriptions, mute),
  );
