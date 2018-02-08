/* @flow */
import isEqual from 'lodash.isequal';

import type { Props } from '../message/MessageListContainer';
import htmlBody from './htmlBody';
import renderMessagesAsHtml from './renderMessagesAsHtml';
import messageTypingAsHtml from './messageTypingAsHtml';

let previousContent = '';

const updateContent = (prevProps: Props, nextProps: Props, sendMessage: any => void) => {
  const content = htmlBody(renderMessagesAsHtml(nextProps), nextProps.showMessagePlaceholders);

  if (content === previousContent) {
    return;
  }

  previousContent = content;
  const sameNarrow = isEqual(prevProps.narrow, nextProps.narrow);
  const noMessages = nextProps.messages.length === 0;
  const noNewMessages = sameNarrow && prevProps.messages.length === nextProps.messages.length;
  const oldMessages =
    sameNarrow &&
    prevProps.messages.length > 0 &&
    nextProps.messages.length > 0 &&
    prevProps.messages[0].id > nextProps.messages[0].id;
  const newMessages =
    sameNarrow &&
    prevProps.messages.length > 0 &&
    nextProps.messages.length > 0 &&
    prevProps.messages[prevProps.messages.length - 1].id <
      nextProps.messages[nextProps.messages.length - 1].id;
  const onlyOneNewMessage =
    prevProps.messages.length > 0 &&
    nextProps.messages.length > 1 &&
    prevProps.messages[prevProps.messages.length - 1].id ===
      nextProps.messages[nextProps.messages.length - 2].id;

  sendMessage({
    type: 'content',
    anchor: nextProps.anchor,
    sameNarrow,
    noMessages,
    noNewMessages,
    onlyOneNewMessage,
    oldMessages,
    newMessages,
    content,
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
