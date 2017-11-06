import React, { PureComponent } from 'react';
import { connectActionSheet } from '@expo/react-native-action-sheet';

import type { Actions, Fetching, Narrow } from '../types';
import connectWithActions from '../connectWithActions';
import MessageList from './MessageList';
// import MessageList from './MessageListFlatList';
import MessageListWeb from './MessageListWeb';
import {
  getAuth,
  getCurrentTypingUsers,
  getRenderedMessages,
  getActiveNarrow,
  getFlags,
  getCaughtUpForActiveNarrow,
  getAnchorForCurrentNarrow,
  getFetchingForActiveNarrow,
  getSubscriptions,
} from '../selectors';
import { filterUnreadMessageIds } from '../utils/unread';
import { registerAppActivity } from '../utils/activity';
import { queueMarkAsRead } from '../api';

type Props = {
  actions: Actions,
  caughtUp: boolean,
  fetching: Fetching,
  typingUsers: any,
  htmlMessages: boolean,
  renderedMessages: any,
  narrow: Narrow,
  listRef: () => void,
  onReplySelect: () => void,
  onSend: () => void,
};

class MessageListContainer extends PureComponent<Props> {
  props: Props;

  handleMessageListScroll = (e: Object) => {
    const { auth, flags } = this.props;
    const visibleMessageIds = e.visibleIds.map(x => +x);
    const unreadMessageIds = filterUnreadMessageIds(visibleMessageIds, flags);

    if (unreadMessageIds.length > 0) {
      queueMarkAsRead(auth, unreadMessageIds);
    }

    // Calculates the amount user has scrolled up from the very bottom
    this.scrollOffset = e.contentSize.height - e.contentOffset.y - e.layoutMeasurement.height;

    registerAppActivity(auth);
  };

  render() {
    const {
      anchor,
      actions,
      caughtUp,
      fetching,
      typingUsers,
      onReplySelect,
      renderedMessages,
      narrow,
      htmlMessages,
      listRef,
      onSend,
    } = this.props;

    const MessageListComponent = htmlMessages ? MessageListWeb : MessageList;

    return (
      <MessageListComponent
        auth={this.props.auth}
        anchor={anchor}
        subscriptions={this.props.subscriptions}
        isFetching={false}
        actions={actions}
        caughtUpNewer={caughtUp.newer}
        caughtUpOlder={caughtUp.older}
        fetchingOlder={fetching.older}
        fetchingNewer={fetching.newer}
        onReplySelect={onReplySelect}
        typingUsers={typingUsers}
        renderedMessages={renderedMessages}
        narrow={narrow}
        listRef={listRef}
        onScroll={this.handleMessageListScroll}
        onSend={onSend}
      />
    );
  }
}

export default connectWithActions(state => ({
  htmlMessages: state.app.debug.htmlMessages,
  caughtUp: getCaughtUpForActiveNarrow(state),
  fetching: getFetchingForActiveNarrow(state),
  typingUsers: getCurrentTypingUsers(state),
  renderedMessages: getRenderedMessages(state),
  anchor: getAnchorForCurrentNarrow(state),
  subscriptions: getSubscriptions(state),
  narrow: getActiveNarrow(state),
  auth: getAuth(state),
  flags: getFlags(state),
}))(connectActionSheet(MessageListContainer));
