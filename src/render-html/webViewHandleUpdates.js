/* @flow */
import isEqual from 'lodash.isequal';

import type { Props } from '../message/MessageListContainer';
import { htmlBody } from './html';
import renderMessagesAsHtml from './renderMessagesAsHtml';
import messageTypingAsHtml from './messageTypingAsHtml';

let previousContent = '';

export default (prevProps: Props, nextProps: Props, sendMessage: any => void) => {
  if (
    !isEqual(prevProps.fetching, nextProps.fetching) ||
    prevProps.showMessagePlaceholders !== nextProps.showMessagePlaceholders
  ) {
    sendMessage({
      type: 'fetching',
      showMessagePlaceholders: nextProps.showMessagePlaceholders,
      fetchingOlder: nextProps.fetching.older && !nextProps.showMessagePlaceholders,
      fetchingNewer: nextProps.fetching.newer && !nextProps.showMessagePlaceholders,
    });
  }

  if (prevProps.renderedMessages !== nextProps.renderedMessages) {
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
