/* @flow */
import { createSelector } from 'reselect';

import { getMute, getSubscriptions } from '../directSelectors';
import { getActiveNarrow } from '../baseSelectors';
import { getShownMessagesInActiveNarrow } from '../chat/chatSelectors';
import renderMessages from './renderMessages';
import { findAnchor } from '../utils/message';
import { NULL_MESSAGE } from '../nullObjects';

export const getRenderedMessages = createSelector(
  getShownMessagesInActiveNarrow,
  getActiveNarrow,
  (messages, narrow) => renderMessages(messages, narrow),
);

export const getAnchorForActiveNarrow = createSelector(
  getShownMessagesInActiveNarrow,
  getSubscriptions,
  getMute,
  (messages, subscriptions, mute) => findAnchor(messages, subscriptions, mute),
);

export const getLastMessageInActiveNarrow = createSelector(
  getShownMessagesInActiveNarrow,
  messages => (messages.length === 0 ? NULL_MESSAGE : messages[messages.length - 1]),
);
