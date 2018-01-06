/* @flow */
import isEqual from 'lodash.isequal';

import type { Props } from '../message/MessageListContainer';
import renderMessagesAsHtml from './renderMessagesAsHtml';
import messageTypingAsHtml from './messageTypingAsHtml';

let previousContent = '';

export default (prevProps: Props, nextProps: Props, sendMessage: any => void) => {
  if (
    prevProps.fetching.older !== nextProps.fetching.older ||
    prevProps.fetching.newer !== nextProps.fetching.newer ||
    prevProps.showMessagePlaceholders !== nextProps.showMessagePlaceholders
  ) {
    sendMessage({
      type: 'fetching',
      showMessagePlaceholders: nextProps.isFetching,
      fetchingOlder: nextProps.fetching.older,
      fetchingNewer: nextProps.fetching.newer,
    });
  }

  if (prevProps.renderedMessages !== nextProps.renderedMessages) {
    const content = renderMessagesAsHtml(nextProps);

    if (content !== previousContent) {
      previousContent = content;
      sendMessage({
        type: 'content',
        anchor: isEqual(prevProps.narrow, nextProps.narrow) ? 0 : nextProps.anchor,
        content,
      });
    }
  }

  if (prevProps.typingUsers !== nextProps.typingUsers) {
    sendMessage({
      type: 'typing',
      content: nextProps.typingUsers
        ? messageTypingAsHtml(nextProps.auth.realm, nextProps.typingUsers)
        : '',
    });
  }
};
