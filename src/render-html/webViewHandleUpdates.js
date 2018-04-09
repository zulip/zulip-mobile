/* @flow */
import isEqual from 'lodash.isequal';

import type { Props } from '../message/MessageListContainer';
import type { UpdateStrategy } from '../message/messageUpdates';
import htmlBody from './htmlBody';
import renderMessagesAsHtml from './renderMessagesAsHtml';
import messageTypingAsHtml from './messageTypingAsHtml';
import { getMessageTransitionProps, getMessageUpdateStrategy } from '../message/messageUpdates';

export type MessageContent = {
  type: 'content',
  anchor: number,
  content: string,
  updateStrategy: UpdateStrategy,
};

export type MessageFetching = {
  type: 'fetching',
  showMessagePlaceholders: boolean,
  fetchingOlder: boolean,
  fetchingNewer: boolean,
};

export type MessageTyping = {
  type: 'typing',
  content: string,
};

export type WebviewInputMessage = MessageContent | MessageFetching | MessageTyping;

const updateContent = (prevProps: Props, nextProps: Props, sendMessage: any => void) => {
  const content = htmlBody(renderMessagesAsHtml(nextProps), nextProps.showMessagePlaceholders);
  const transitionProps = getMessageTransitionProps(prevProps, nextProps);
  const updateStrategy = getMessageUpdateStrategy(transitionProps);

  const message: MessageContent = {
    type: 'content',
    anchor: nextProps.anchor,
    content,
    updateStrategy,
  };
  sendMessage(message);
};

const updateFetching = (
  prevProps: Props,
  nextProps: Props,
  sendMessage: (msg: WebviewInputMessage) => void,
) => {
  const message: MessageFetching = {
    type: 'fetching',
    showMessagePlaceholders: nextProps.showMessagePlaceholders,
    fetchingOlder: nextProps.fetching.older && !nextProps.showMessagePlaceholders,
    fetchingNewer: nextProps.fetching.newer && !nextProps.showMessagePlaceholders,
  };
  sendMessage(message);
};

const updateTyping = (
  prevProps: Props,
  nextProps: Props,
  sendMessage: (msg: WebviewInputMessage) => void,
) => {
  const message: MessageTyping = {
    type: 'typing',
    content:
      nextProps.typingUsers.length > 0
        ? messageTypingAsHtml(nextProps.auth.realm, nextProps.typingUsers)
        : '',
  };
  sendMessage(message);
};

export default (
  prevProps: Props,
  nextProps: Props,
  sendMessage: (msg: WebviewInputMessage) => void,
) => {
  if (!isEqual(prevProps.renderedMessages, nextProps.renderedMessages)) {
    updateContent(prevProps, nextProps, sendMessage);
  }

  if (
    !isEqual(prevProps.fetching, nextProps.fetching) ||
    prevProps.showMessagePlaceholders !== nextProps.showMessagePlaceholders
  ) {
    updateFetching(prevProps, nextProps, sendMessage);
  }

  if (!isEqual(prevProps.typingUsers, nextProps.typingUsers)) {
    updateTyping(prevProps, nextProps, sendMessage);
  }
};
