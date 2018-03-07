/* @flow */
import { createSelector } from 'reselect';

import type { Narrow } from '../types';
import { getMute, getSubscriptions } from '../directSelectors';
import { getShownMessagesInActiveNarrow } from '../chat/chatSelectors';
import renderMessages from './renderMessages';
import { findAnchor } from '../utils/message';
import { NULL_MESSAGE } from '../nullObjects';

export const getRenderedMessages = (narrow: Narrow) =>
  createSelector(getShownMessagesInActiveNarrow(narrow), messages =>
    renderMessages(messages, narrow),
  );

export const getAnchorForActiveNarrow = (narrow: Narrow) =>
  createSelector(
    getShownMessagesInActiveNarrow(narrow),
    getSubscriptions,
    getMute,
    (messages, subscriptions, mute) => findAnchor(messages, subscriptions, mute),
  );

export const getLastMessageInActiveNarrow = (narrow: Narrow) =>
  createSelector(
    getShownMessagesInActiveNarrow(narrow),
    messages => (messages.length === 0 ? NULL_MESSAGE : messages[messages.length - 1]),
  );
