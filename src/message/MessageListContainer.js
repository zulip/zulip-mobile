/* @flow */
import React, { PureComponent } from 'react';
import { connectActionSheet } from '@expo/react-native-action-sheet';

import type { Actions, Auth, Fetching, FlagsState, Message, Narrow, Subscription } from '../types';
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
  getShowMessagePlaceholders,
  getShownMessagesInActiveNarrow,
} from '../selectors';
import { filterUnreadMessageIds } from '../utils/unread';
import { queueMarkAsRead } from '../api';

export type Props = {
  actions: Actions,
  anchor: number,
  auth: Auth,
  fetching: Fetching,
  flags: FlagsState,
  highlightUnreadMessages: boolean,
  htmlMessages: boolean,
  isFetching: boolean,
  messages: Message[],
  narrow: Narrow,
  renderedMessages: any,
  showMessagePlaceholders: boolean,
  subscriptions: Subscription[],
  typingUsers?: any,
  listRef: (component: any) => void,
  onReplySelect: () => void,
  onScroll: (e: Event) => void,
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
    const { fetching, onReplySelect, htmlMessages } = this.props;

    const MessageListComponent = htmlMessages ? MessageListWeb : MessageList;

    return (
      <MessageListComponent
        {...this.props}
        fetchingOlder={fetching.older}
        fetchingNewer={fetching.newer}
        onReplySelect={onReplySelect}
        onScroll={this.handleMessageListScroll}
      />
    );
  }
}

export default connectWithActions(state => ({
  anchor: getAnchorForActiveNarrow(state),
  auth: getAuth(state),
  fetching: getFetchingForActiveNarrow(state),
  flags: getFlags(state),
  htmlMessages: state.app.debug.htmlMessages,
  highlightUnreadMessages: state.app.debug.highlightUnreadMessages,
  isFetching: getIsFetching(state),
  messages: getShownMessagesInActiveNarrow(state),
  narrow: getActiveNarrow(state),
  renderedMessages: getRenderedMessages(state),
  showMessagePlaceholders: getShowMessagePlaceholders(state),
  subscriptions: getSubscriptions(state),
  typingUsers: getCurrentTypingUsers(state),
}))(connectActionSheet(MessageListContainer));
