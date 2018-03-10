/* @flow */
import { createSelector } from 'reselect';

import type { Narrow } from '../types';
import { getFlags, getMute, getSubscriptions } from '../directSelectors';
import { getShownMessagesForNarrow } from '../chat/chatSelectors';
import renderMessages from './renderMessages';
import { findAnchor } from '../utils/message';
import { NULL_MESSAGE } from '../nullObjects';

export const getRenderedMessages = (narrow: Narrow) =>
  createSelector(getShownMessagesForNarrow(narrow), messages =>
    renderMessages(messages, narrow),
  );

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
