/* @flow */
import { createSelector } from 'reselect';

import type { Narrow, RenderedSectionDescriptor, Selector } from '../types';
import { getFlags, getMute, getSubscriptions } from '../directSelectors';
import { getShownMessagesForNarrow } from '../chat/narrowSelectors';
import renderMessages from './renderMessages';
import { findAnchor } from '../utils/message';

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
