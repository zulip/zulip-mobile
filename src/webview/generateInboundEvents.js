/* @flow strict-local */
// $FlowFixMe[untyped-import]
import isEqual from 'lodash.isequal';

import type { Auth, FlagsState } from '../types';
import type { Props } from './MessageList';
import type { ScrollStrategy } from '../message/scrollStrategy';
import messageListElementHtml from './html/messageListElementHtml';
import messageTypingAsHtml from './html/messageTypingAsHtml';
import { getScrollStrategy } from '../message/scrollStrategy';

export type WebViewInboundEventContent = {|
  type: 'content',
  scrollMessageId: number | null,
  auth: Auth,
  content: string,
  scrollStrategy: ScrollStrategy,
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

export type WebViewInboundEventSetRead = {|
  type: 'set-read',
  value: boolean,
  messageIds: $ReadOnlyArray<number>,
|};

export type WebViewInboundEvent =
  | WebViewInboundEventContent
  | WebViewInboundEventFetching
  | WebViewInboundEventTyping
  | WebViewInboundEventReady
  | WebViewInboundEventSetRead;

const updateContent = (prevProps: Props, nextProps: Props): WebViewInboundEventContent => {
  const scrollStrategy = getScrollStrategy(prevProps, nextProps);

  return {
    type: 'content',
    scrollMessageId: nextProps.initialScrollMessageId,
    auth: nextProps.backgroundData.auth,
    content: nextProps.messageListElementsForShownMessages
      .map(element =>
        messageListElementHtml({
          backgroundData: nextProps.backgroundData,
          element,
          _: nextProps._,
        }),
      )
      .join(''),
    scrollStrategy,
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
    // TODO(#4655): Should also update here if backgroundData.mutedUsers
    //   changes, e.g. because the user muted someone.
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
        type: 'set-read',
        value: true,
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
