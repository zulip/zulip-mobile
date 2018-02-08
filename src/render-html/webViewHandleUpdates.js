/* @flow */
import isEqual from 'lodash.isequal';

import type { Props } from '../message/MessageListContainer';
import htmlBody from './htmlBody';
import renderMessagesAsHtml from './renderMessagesAsHtml';
import messageTypingAsHtml from './messageTypingAsHtml';
import { getMessageTransitionProps } from '../message/messageUpdates';

let previousContent = '';

const updateContent = (prevProps: Props, nextProps: Props, sendMessage: any => void) => {
  const content = htmlBody(renderMessagesAsHtml(nextProps), nextProps.showMessagePlaceholders);

  if (content === previousContent) {
    return;
  }

  previousContent = content;
  const transitionProps = getMessageTransitionProps(prevProps, nextProps);

  sendMessage({
    type: 'content',
    anchor: nextProps.anchor,
    content,
    ...transitionProps,
  });
};

const updateFetching = (prevProps: Props, nextProps: Props, sendMessage: any => void) => {
  sendMessage({
    type: 'fetching',
    showMessagePlaceholders: nextProps.showMessagePlaceholders,
    fetchingOlder: nextProps.fetching.older && !nextProps.showMessagePlaceholders,
    fetchingNewer: nextProps.fetching.newer && !nextProps.showMessagePlaceholders,
  });
};

const updateTyping = (prevProps: Props, nextProps: Props, sendMessage: any => void) => {
  sendMessage({
    type: 'typing',
    content: nextProps.typingUsers
      ? messageTypingAsHtml(nextProps.auth.realm, nextProps.typingUsers)
      : '',
  });
};

export default (prevProps: Props, nextProps: Props, sendMessage: any => void) => {
  if (prevProps.renderedMessages !== nextProps.renderedMessages) {
    updateContent(prevProps, nextProps, sendMessage);
  }

  if (
    !isEqual(prevProps.fetching, nextProps.fetching) ||
    prevProps.showMessagePlaceholders !== nextProps.showMessagePlaceholders
  ) {
    updateFetching(prevProps, nextProps, sendMessage);
  }

  if (prevProps.typingUsers !== nextProps.typingUsers) {
    updateTyping(prevProps, nextProps, sendMessage);
  }
};
