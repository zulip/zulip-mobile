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
import { getShownMessagesForNarrow } from '../chat/narrowsSelectors';
import renderMessages from './renderMessages';
import { findAnchor } from '../utils/message';
import { ALL_PRIVATE_NARROW_STR } from '../utils/narrow';
import { NULL_ARRAY } from '../nullObjects';

export const getPrivateMessages: Selector<Message[]> = createSelector(
  getAllNarrows,
  getMessages,
  (narrows, messages) => (narrows[ALL_PRIVATE_NARROW_STR] || NULL_ARRAY).map(id => messages[id]),
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
