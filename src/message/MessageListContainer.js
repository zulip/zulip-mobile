import React, { PureComponent } from 'react';

import { connect } from 'react-redux';
import { connectActionSheet } from '@expo/react-native-action-sheet';

import boundActions from '../boundActions';
import MessageList from './MessageList';
import {
  getAuth,
  getCurrentTypingUsers,
  getRenderedMessages,
  getActiveNarrow,
  getFlags,
} from '../selectors';
import { filterUnreadMessageIds } from '../utils/unread';
import { registerAppActivity } from '../utils/activity';
import { queueMarkAsRead } from '../api';

class MessageListContainer extends PureComponent {
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
      actions,
      caughtUpOlder,
      caughtUpNewer,
      fetchingOlder,
      fetchingNewer,
      typingUsers,
      onReplySelect,
      renderedMessages,
      narrow,
      listRef,
      onSend,
    } = this.props;
    return (
      <MessageList
        actions={actions}
        caughtUpNewer={caughtUpNewer}
        caughtUpOlder={caughtUpOlder}
        fetchingOlder={fetchingOlder}
        fetchingNewer={fetchingNewer}
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

export default connect(
  state => ({
    fetchingOlder: state.chat.fetchingOlder,
    fetchingNewer: state.chat.fetchingNewer,
    typingUsers: getCurrentTypingUsers(state),
    renderedMessages: getRenderedMessages(state),
    narrow: getActiveNarrow(state),
    auth: getAuth(state),
    flags: getFlags(state),
  }),
  boundActions,
)(connectActionSheet(MessageListContainer));
