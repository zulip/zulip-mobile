/* @flow */
import { createSelector } from 'reselect';

import type { Narrow, RenderedSectionDescriptor, Selector } from '../types';
import { getAllNarrows, getFlags, getMute, getSubscriptions } from '../directSelectors';
import { getShownMessagesForNarrow } from '../chat/chatSelectors';
import renderMessages from './renderMessages';
import { findAnchor } from '../utils/message';
import { NULL_ARRAY, NULL_MESSAGE } from '../nullObjects';
import { ALL_PRIVATE_NARROW_STR } from '../utils/narrow';

export const getPrivateMessages = createSelector(
  getAllNarrows,
  messages => messages[ALL_PRIVATE_NARROW_STR] || NULL_ARRAY,
);

export const getRenderedMessages = (narrow: Narrow): Selector<RenderedSectionDescriptor[]> =>
  createSelector(getShownMessagesForNarrow(narrow), messages => renderMessages(messages, narrow));

export const getAnchorForActiveNarrow = (narrow: Narrow) =>
  createSelector(
    getShownMessagesForNarrow(narrow),
    getFlags,
    getSubscriptions,
    getMute,
    (messages, flags, subscriptions, mute) => findAnchor(messages, flags, subscriptions, mute),
  );

export const getLastMessageForNarrow = (narrow: Narrow) =>
  createSelector(
    getShownMessagesForNarrow(narrow),
    messages => (messages.length === 0 ? NULL_MESSAGE : messages[messages.length - 1]),
  );
