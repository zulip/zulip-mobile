/* @flow */
import React, { PureComponent } from 'react';
import { connectActionSheet } from '@expo/react-native-action-sheet';

import type {
  Actions,
  Auth,
  CaughtUp,
  Fetching,
  FlagsState,
  Message,
  Narrow,
  Subscription,
} from '../types';
import connectWithActions from '../connectWithActions';
import MessageList from '../render-native/MessageListScrollView';
// import MessageList from '../render-native/MessageListFlatList';
import MessageListWeb from '../render-html/MessageListWeb';
import {
  getAuth,
  getCurrentTypingUsers,
  getRenderedMessages,
  getActiveNarrow,
  getFlags,
  getIsFetching,
  getAnchorForActiveNarrow,
  getFetchingForActiveNarrow,
  getSubscriptions,
  getShownMessagesInActiveNarrow,
} from '../selectors';
import { filterUnreadMessageIds } from '../utils/unread';
import { queueMarkAsRead } from '../api';

type Props = {
  actions: Actions,
  anchor: number,
  auth: Auth,
  caughtUp: CaughtUp,
  isFetching: boolean,
  fetching: Fetching,
  flags: FlagsState,
  typingUsers: any,
  htmlMessages: boolean,
  messages: Message[],
  renderedMessages: any,
  subscriptions: Subscription[],
  narrow: Narrow,
  listRef: () => void,
  onReplySelect: () => void,
  onSend: () => void,
};

class MessageListContainer extends PureComponent<Props> {
  props: Props;

  handleMessageListScroll = (e: Object) => {
    const { auth, flags } = this.props;
    const visibleMessageIds = e.visibleIds ? e.visibleIds.map(x => +x) : [];
    const unreadMessageIds = filterUnreadMessageIds(visibleMessageIds, flags);

    if (unreadMessageIds.length > 0) {
      queueMarkAsRead(auth, unreadMessageIds);
    }
  };

  render() {
    const { fetching, onReplySelect, htmlMessages, isFetching, messages } = this.props;

    const MessageListComponent = htmlMessages ? MessageListWeb : MessageList;

    return (
      <MessageListComponent
        {...this.props}
        fetchingOlder={fetching.older}
        fetchingNewer={fetching.newer}
        onReplySelect={onReplySelect}
        onScroll={this.handleMessageListScroll}
        isEmptyView={isFetching && messages.length === 0}
      />
    );
  }
}

export default connectWithActions(state => ({
  htmlMessages: state.app.debug.htmlMessages,
  isFetching: getIsFetching(state),
  fetching: getFetchingForActiveNarrow(state),
  typingUsers: getCurrentTypingUsers(state),
  messages: getShownMessagesInActiveNarrow(state),
  renderedMessages: getRenderedMessages(state),
  anchor: getAnchorForActiveNarrow(state),
  subscriptions: getSubscriptions(state),
  narrow: getActiveNarrow(state),
  auth: getAuth(state),
  flags: getFlags(state),
}))(connectActionSheet(MessageListContainer));
