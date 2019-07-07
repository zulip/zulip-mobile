/* @flow strict-local */
import isEqual from 'lodash.isequal';

import type { Auth, FlagsState } from '../types';
import type { Props } from './MessageList';
import type { UpdateStrategy } from '../message/messageUpdates';
import htmlBody from './html/htmlBody';
import renderMessagesAsHtml from './html/renderMessagesAsHtml';
import messageTypingAsHtml from './html/messageTypingAsHtml';
import { getMessageTransitionProps, getMessageUpdateStrategy } from '../message/messageUpdates';

export type WebViewUpdateEventContent = {|
  type: 'content',
  anchor: number,
  auth: Auth,
  content: string,
  updateStrategy: UpdateStrategy,
|};

export type WebViewUpdateEventFetching = {|
  type: 'fetching',
  showMessagePlaceholders: boolean,
  fetchingOlder: boolean,
  fetchingNewer: boolean,
|};

export type WebViewUpdateEventTyping = {|
  type: 'typing',
  content: string,
|};

export type WebViewUpdateEventReady = {|
  type: 'ready',
|};

export type WebViewUpdateEventMessagesRead = {
  type: 'read',
  messageIds: number[],
};

export type WebViewUpdateEvent =
  | WebViewUpdateEventContent
  | WebViewUpdateEventFetching
  | WebViewUpdateEventTyping
  | WebViewUpdateEventReady
  | WebViewUpdateEventMessagesRead;

const updateContent = (prevProps: Props, nextProps: Props): WebViewUpdateEventContent => {
  const content = htmlBody(
    renderMessagesAsHtml(nextProps.backgroundData, nextProps.narrow, nextProps.renderedMessages),
    nextProps.showMessagePlaceholders,
  );
  const transitionProps = getMessageTransitionProps(prevProps, nextProps);
  const updateStrategy = getMessageUpdateStrategy(transitionProps);

  return {
    type: 'content',
    anchor: nextProps.anchor,
    auth: nextProps.backgroundData.auth,
    content,
    updateStrategy,
  };
};

const updateFetching = (prevProps: Props, nextProps: Props): WebViewUpdateEventFetching => ({
  type: 'fetching',
  showMessagePlaceholders: nextProps.showMessagePlaceholders,
  fetchingOlder: nextProps.fetching.older && !nextProps.showMessagePlaceholders,
  fetchingNewer: nextProps.fetching.newer && !nextProps.showMessagePlaceholders,
});

const updateTyping = (prevProps: Props, nextProps: Props): WebViewUpdateEventTyping => ({
  type: 'typing',
  content:
    nextProps.typingUsers.length > 0
      ? messageTypingAsHtml(nextProps.backgroundData.auth.realm, nextProps.typingUsers)
      : '',
});

const updateRead = (prevProps: Props, nextProps: Props): WebViewUpdateEventMessagesRead => ({
  type: 'read',
  messageIds: Object.keys(nextProps.backgroundData.flags.read)
    .filter(id => !prevProps.backgroundData.flags.read[+id])
    .map(id => +id),
});

const equalFlagsExcludingRead = (prevFlags: FlagsState, nextFlags: FlagsState): boolean => {
  const allFlagNames = Array.from(
    new Set([...Object.keys(prevFlags || {}), ...Object.keys(nextFlags || {})]),
  );
  return allFlagNames
    .filter(name => name !== 'read')
    .every(name => prevFlags[name] === nextFlags[name]);
};

export const getUpdateEvents = (prevProps: Props, nextProps: Props): WebViewUpdateEvent[] => {
  if (
    !isEqual(prevProps.renderedMessages, nextProps.renderedMessages)
    || !equalFlagsExcludingRead(prevProps.backgroundData.flags, nextProps.backgroundData.flags)
  ) {
    return [updateContent(prevProps, nextProps)];
  }

  const uevents = [];

  if (
    prevProps.backgroundData.flags
    && !isEqual(prevProps.backgroundData.flags.read, nextProps.backgroundData.flags.read)
  ) {
    uevents.push(updateRead(prevProps, nextProps));
  }

  if (
    !isEqual(prevProps.fetching, nextProps.fetching)
    || prevProps.showMessagePlaceholders !== nextProps.showMessagePlaceholders
  ) {
    uevents.push(updateFetching(prevProps, nextProps));
  }

  if (!isEqual(prevProps.typingUsers, nextProps.typingUsers)) {
    uevents.push(updateTyping(prevProps, nextProps));
  }

  return uevents;
};
