/* @flow */
import { createSelector } from 'reselect';

import type { Narrow } from '../types';
import { getFlags, getMute, getSubscriptions } from '../directSelectors';
import { getShownMessagesforNarrow } from '../chat/chatSelectors';
import renderMessages from './renderMessages';
import { findAnchor } from '../utils/message';
import { NULL_MESSAGE } from '../nullObjects';

export const getRenderedMessages = (narrow: Narrow) =>
  createSelector(getShownMessagesforNarrow(narrow), messages =>
    renderMessages(messages, narrow),
  );

export const getAnchorForActiveNarrow = (narrow: Narrow) =>
  createSelector(
    getShownMessagesforNarrow(narrow),
    getFlags,
    getSubscriptions,
    getMute,
    (messages, flags, subscriptions, mute) => findAnchor(messages, flags, subscriptions, mute),
  );

export const getLastMessageforNarrow = (narrow: Narrow) =>
  createSelector(
    getShownMessagesforNarrow(narrow),
    messages => (messages.length === 0 ? NULL_MESSAGE : messages[messages.length - 1]),
  );
