/* @flow */
import type { Actions, Auth, Narrow, TypingState } from '../types';
import renderMessagesAsHtml from './renderMessagesAsHtml';
import messageTypingAsHtml from './messageTypingAsHtml';

type Props = {
  actions: Actions,
  auth: Auth,
  isFetching: boolean,
  fetchingOlder: boolean,
  fetchingNewer: boolean,
  renderedMessages: Object[],
  anchor: number,
  narrow?: Narrow,
  typingUsers?: TypingState,
};

let previousContent = '';

export default (prevProps: Props, nextProps: Props, sendMessage: any => void) => {
  if (
    prevProps.fetchingOlder !== nextProps.fetchingOlder ||
    prevProps.fetchingNewer !== nextProps.fetchingNewer
  ) {
    sendMessage({
      type: 'fetching',
      isFetching: nextProps.isFetching && nextProps.messages.length === 0,
      fetchingOlder: nextProps.fetchingOlder,
      fetchingNewer: nextProps.fetchingNewer,
    });
  }

  if (prevProps.renderedMessages !== nextProps.renderedMessages) {
    const content = renderMessagesAsHtml(nextProps);

    if (content !== previousContent) {
      previousContent = content;
      sendMessage({
        type: 'content',
        anchor: nextProps.anchor,
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
