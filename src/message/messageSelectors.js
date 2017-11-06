/* @flow */
import { createSelector } from 'reselect';

import { getActiveNarrow } from '../directSelectors';
import { getShownMessagesInActiveNarrow } from '../chat/chatSelectors';
import renderMessages from './renderMessages';
import { findFirstUnread } from '../utils/message';

export const getRenderedMessages = createSelector(
  getShownMessagesInActiveNarrow,
  getActiveNarrow,
  (messages, narrow) => renderMessages(messages, narrow),
);

export const getAnchorForCurrentNarrow = createSelector(
  getShownMessagesInActiveNarrow,
  messages => findFirstUnread(messages).id,
);
