/* @flow */
import isEqual from 'lodash.isequal';

import type { Props } from '../message/MessageListContainer';
import type { UpdateStrategy } from '../message/messageUpdates';
import htmlBody from './html/htmlBody';
import renderMessagesAsHtml from './html/renderMessagesAsHtml';
import messageTypingAsHtml from './html/messageTypingAsHtml';
import { getMessageTransitionProps, getMessageUpdateStrategy } from '../message/messageUpdates';

export type MessageInputContent = {
  type: 'content',
  anchor: number,
  content: string,
  updateStrategy: UpdateStrategy,
};

export type MessageInputFetching = {
  type: 'fetching',
  showMessagePlaceholders: boolean,
  fetchingOlder: boolean,
  fetchingNewer: boolean,
};

export type MessageInputTyping = {
  type: 'typing',
  content: string,
};

export type WebviewInputMessage = MessageInputContent | MessageInputFetching | MessageInputTyping;

const updateContent = (prevProps: Props, nextProps: Props): MessageInputContent => {
  const content = htmlBody(renderMessagesAsHtml(nextProps), nextProps.showMessagePlaceholders);
  const transitionProps = getMessageTransitionProps(prevProps, nextProps);
  const updateStrategy = getMessageUpdateStrategy(transitionProps);

  return {
    type: 'content',
    anchor: nextProps.anchor,
    content,
    updateStrategy,
  };
};

const updateFetching = (prevProps: Props, nextProps: Props): MessageInputFetching => ({
  type: 'fetching',
  showMessagePlaceholders: nextProps.showMessagePlaceholders,
  fetchingOlder: nextProps.fetching.older && !nextProps.showMessagePlaceholders,
  fetchingNewer: nextProps.fetching.newer && !nextProps.showMessagePlaceholders,
});

const updateTyping = (prevProps: Props, nextProps: Props): MessageInputTyping => ({
  type: 'typing',
  content:
    nextProps.typingUsers.length > 0
      ? messageTypingAsHtml(nextProps.auth.realm, nextProps.typingUsers)
      : '',
});

export const getInputMessages = (prevProps: Props, nextProps: Props): WebviewInputMessage[] => {
  console.log(
    '!!! getInputMessages => renderedMessages',
    prevProps.renderedMessages[0].data,
    nextProps.renderedMessages[0].data,
  );
  console.log(
    '!!! DIFFS',
    !isEqual(prevProps.renderedMessages, nextProps.renderedMessages),
    !isEqual(prevProps.fetching, nextProps.fetching) ||
      prevProps.showMessagePlaceholders !== nextProps.showMessagePlaceholders,
    !isEqual(prevProps.typingUsers, nextProps.typingUsers),
  );

  if (!isEqual(prevProps.renderedMessages, nextProps.renderedMessages)) {
    return [updateContent(prevProps, nextProps)];
  }

  const messages = [];

  if (
    !isEqual(prevProps.fetching, nextProps.fetching) ||
    prevProps.showMessagePlaceholders !== nextProps.showMessagePlaceholders
  ) {
    messages.push(updateFetching(prevProps, nextProps));
  }

  if (!isEqual(prevProps.typingUsers, nextProps.typingUsers)) {
    messages.push(updateTyping(prevProps, nextProps));
  }

  return messages;
};
