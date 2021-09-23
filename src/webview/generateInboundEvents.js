/* @flow strict-local */
// $FlowFixMe[untyped-import]
import isEqual from 'lodash.isequal';

import type { Auth, FlagsState } from '../types';
import type { Props } from './MessageList';
import type { UpdateStrategy } from '../message/messageUpdates';
import htmlBody from './html/htmlBody';
import messageListElementHtml from './html/messageListElementHtml';
import messageTypingAsHtml from './html/messageTypingAsHtml';
import { getMessageUpdateStrategy } from '../message/messageUpdates';

export type WebViewInboundEventContent = {|
  type: 'content',
  scrollMessageId: number | null,
  auth: Auth,
  content: string,
  updateStrategy: UpdateStrategy,
|};

export type WebViewInboundEventFetching = {|
  type: 'fetching',
  showMessagePlaceholders: boolean,
  fetchingOlder: boolean,
  fetchingNewer: boolean,
|};

export type WebViewInboundEventTyping = {|
  type: 'typing',
  content: string,
|};

export type WebViewInboundEventReady = {|
  type: 'ready',
|};

export type WebViewInboundEventMessagesRead = {|
  type: 'read',
  messageIds: number[],
|};

export type WebViewInboundEvent =
  | WebViewInboundEventContent
  | WebViewInboundEventFetching
  | WebViewInboundEventTyping
  | WebViewInboundEventReady
  | WebViewInboundEventMessagesRead;

const updateContent = (prevProps: Props, nextProps: Props): WebViewInboundEventContent => {
  const content = htmlBody(
    messageListElementHtml({
      backgroundData: nextProps.backgroundData,
      narrow: nextProps.narrow,
      messageListElements: nextProps.messageListElementsForShownMessages,
      _: nextProps._,
    }),
    nextProps.showMessagePlaceholders,
  );
  const updateStrategy = getMessageUpdateStrategy(prevProps, nextProps);

  return {
    type: 'content',
    scrollMessageId: nextProps.initialScrollMessageId,
    auth: nextProps.backgroundData.auth,
    content,
    updateStrategy,
  };
};

const updateFetching = (prevProps: Props, nextProps: Props): WebViewInboundEventFetching => ({
  type: 'fetching',
  showMessagePlaceholders: nextProps.showMessagePlaceholders,
  fetchingOlder: nextProps.fetching.older && !nextProps.showMessagePlaceholders,
  fetchingNewer: nextProps.fetching.newer && !nextProps.showMessagePlaceholders,
});

const updateTyping = (prevProps: Props, nextProps: Props): WebViewInboundEventTyping => ({
  type: 'typing',
  content:
    nextProps.typingUsers.length > 0
      ? messageTypingAsHtml(nextProps.backgroundData.auth.realm, nextProps.typingUsers)
      : '',
});

const equalFlagsExcludingRead = (prevFlags: FlagsState, nextFlags: FlagsState): boolean => {
  if (prevFlags === nextFlags) {
    return true;
  }

  const allFlagNames = Array.from(
    new Set([...Object.keys(prevFlags || {}), ...Object.keys(nextFlags || {})]),
  );
  return allFlagNames
    .filter(name => name !== 'read')
    .every(name => prevFlags[name] === nextFlags[name]);
};

export default function generateInboundEvents(
  prevProps: Props,
  nextProps: Props,
): WebViewInboundEvent[] {
  const uevents = [];

  if (
    !isEqual(
      prevProps.messageListElementsForShownMessages,
      nextProps.messageListElementsForShownMessages,
    )
    || !equalFlagsExcludingRead(prevProps.backgroundData.flags, nextProps.backgroundData.flags)
  ) {
    uevents.push(updateContent(prevProps, nextProps));
  }

  if (prevProps.backgroundData.flags.read !== nextProps.backgroundData.flags.read) {
    // TODO: Don't consider messages outside the narrow we're viewing.
    // TODO: Only include messages that we've just marked as read. We're
    // currently including some read messages only because we've just
    // learned about them from a fetch.
    const messageIds = Object.keys(nextProps.backgroundData.flags.read)
      .filter(id => !prevProps.backgroundData.flags.read[+id])
      .map(id => +id);
    if (messageIds.length > 0) {
      uevents.push({
        type: 'read',
        messageIds,
      });
    }
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
}
