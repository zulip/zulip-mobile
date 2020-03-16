/* @flow strict-local */
import isEqual from 'lodash.isequal';

import type { Auth, FlagsState } from '../types';
import type { Props } from './MessageList';
import type { UpdateStrategy } from '../message/messageUpdates';
import type { EditSequence } from './generateEditSequenceEvent';
import messageTypingAsHtml from './html/messageTypingAsHtml';
import generateEditSequenceEvent from './generateEditSequenceEvent';

export type WebViewInboundEventEditSequence = {|
  type: 'edit-sequence',
  sequence: EditSequence,
|};

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

export type WebViewInboundEventMessagesRead = {
  type: 'read',
  messageIds: number[],
};

export type WebViewInboundEvent =
  | WebViewInboundEventContent
  | WebViewInboundEventEditSequence
  | WebViewInboundEventFetching
  | WebViewInboundEventTyping
  | WebViewInboundEventReady
  | WebViewInboundEventMessagesRead;

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

export default (prevProps: Props, nextProps: Props): WebViewInboundEvent[] => {
  const uevents = [];

  if (
    !isEqual(prevProps.htmlPieceDescriptors, nextProps.htmlPieceDescriptors)
    || !equalFlagsExcludingRead(prevProps.backgroundData.flags, nextProps.backgroundData.flags)
  ) {
    uevents.push(
      generateEditSequenceEvent(
        {
          backgroundData: prevProps.backgroundData,
          narrow: prevProps.narrow,
          pieceDescriptors: prevProps.htmlPieceDescriptors,
        },
        {
          backgroundData: nextProps.backgroundData,
          narrow: nextProps.narrow,
          pieceDescriptors: nextProps.htmlPieceDescriptors,
        },
      ),
    );
  }

  if (prevProps.backgroundData.flags.read !== nextProps.backgroundData.flags.read) {
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
};
