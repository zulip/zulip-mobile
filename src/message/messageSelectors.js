/* @flow */
import { createSelector } from 'reselect';

import { getActiveNarrow } from '../baseSelectors';
import { getShownMessagesInActiveNarrow } from '../chat/chatSelectors';
import renderMessages from './renderMessages';

export const getRenderedMessages = createSelector(
  getShownMessagesInActiveNarrow,
  getActiveNarrow,
  (messages, narrow) => renderMessages(messages, narrow),
);
