/* @flow */
import { createSelector } from 'reselect';

import { getActiveNarrow, getMute, getSubscriptions } from '../directSelectors';
import { getShownMessagesInActiveNarrow } from '../chat/chatSelectors';
import renderMessages from './renderMessages';
import { findFirstUnread } from '../utils/message';
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
  (messages, subscriptions, mute) => findFirstUnread(messages, subscriptions, mute).id,
);

export const getLastMessageInActiveNarrow = createSelector(
  getShownMessagesInActiveNarrow,
  messages => (messages.length === 0 ? NULL_MESSAGE : messages[messages.length - 1]),
);
