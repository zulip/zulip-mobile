/* @flow */
import isEqual from 'lodash.isequal';

import type { Props } from '../message/MessageListContainer';
import { htmlBody } from './html';
import renderMessagesAsHtml from './renderMessagesAsHtml';
import messageTypingAsHtml from './messageTypingAsHtml';

let previousContent = '';

const updateContent = (prevProps: Props, nextProps: Props, sendMessage: any => void) => {
  const content = htmlBody(renderMessagesAsHtml(nextProps), nextProps.showMessagePlaceholders);

  if (content !== previousContent) {
    previousContent = content;
    sendMessage({
      type: 'content',
      anchor: nextProps.anchor,
      sameNarrow: isEqual(prevProps.narrow, nextProps.narrow),
      content,
    });
  }
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
