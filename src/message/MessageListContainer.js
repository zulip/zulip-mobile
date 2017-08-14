import React, { PureComponent } from 'react';

import { connect } from 'react-redux';
import { connectActionSheet } from '@expo/react-native-action-sheet';

import boundActions from '../boundActions';
import MessageList from './MessageList';
import {
  getAuth,
  getFlags,
  getCurrentTypingUsers,
  getShownMessagesInActiveNarrow,
  getActiveNarrow,
  getCaughtUpForActiveNarrow,
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
      caughtUpOlder,
      caughtUpNewer,
      fetchingOlder,
      fetchingNewer,
      typingUsers,
      messages,
      narrow,
      actions,
    } = this.props;
    return (
      <MessageList
        onScroll={this.handleMessageListScroll}
        caughtUpNewer={caughtUpNewer}
        caughtUpOlder={caughtUpOlder}
        fetchingOlder={fetchingOlder}
        fetchingNewer={fetchingNewer}
        typingUsers={typingUsers}
        messages={messages}
        narrow={narrow}
        actions={actions}
      />
    );
  }
}

export default connect(
  state => ({
    caughtUpOlder: getCaughtUpForActiveNarrow(state).older,
    caughtUpNewer: getCaughtUpForActiveNarrow(state).older,
    fetchingOlder: state.chat.fetchingOlder,
    fetchingNewer: state.chat.fetchingNewer,
    typingUsers: getCurrentTypingUsers(state),
    messages: getShownMessagesInActiveNarrow(state),
    narrow: getActiveNarrow(state),
    flags: getFlags(state),
    auth: getAuth(state),
  }),
  boundActions,
)(connectActionSheet(MessageListContainer));
