import React from 'react';
import { connect } from 'react-redux';
import isEqual from 'lodash.isequal';

import config from '../config';
import boundActions from '../boundActions';
import {
  getShownMessagesInActiveNarrow,
  getAnchor,
  getCurrentTypingUsers,
} from '../chat/chatSelectors';
import { getAuth } from '../account/accountSelectors';
import MainScreen from './MainScreen';
import { initializeNotifications } from '../utils/notifications';

class MainScreenContainer extends React.Component {
  componentWillMount() {
    const { auth, saveTokenGCM, switchNarrow } = this.props;
    initializeNotifications(auth, saveTokenGCM, switchNarrow);
  }

  componentWillReceiveProps(nextProps) {
    const { auth, fetchMessagesAtFirstUnread, narrow } = this.props;

    if (!isEqual(narrow, nextProps.narrow) && nextProps.messages.length === 0) {
      fetchMessagesAtFirstUnread(auth, nextProps.narrow);
    }
  }

  fetchOlder = () => {
    const { auth, fetching, caughtUp, anchor, narrow, fetchMessages } = this.props;
    if (!fetching.older && !caughtUp.older && anchor) {
      fetchMessages(auth, anchor.older, config.messagesPerRequest, 0, narrow);
    }
  };

  fetchNewer = () => {
    const { auth, fetching, caughtUp, anchor, narrow, fetchMessages } = this.props;
    if (!fetching.newer && !caughtUp.newer && anchor) {
      fetchMessages(auth, anchor.newer, 0, config.messagesPerRequest, narrow);
    }
  };

  render() {
    return (
      <MainScreen
        fetchOlder={this.fetchOlder}
        fetchNewer={this.fetchNewer}
        markAsRead={this.handleMarkAsRead}
        {...this.props}
      />
    );
  }
}

export default connect(state => ({
  auth: getAuth(state),
  isOnline: state.app.isOnline,
  orientation: state.app.orientation,
  subscriptions: state.subscriptions,
  streams: state.streams,
  messages: getShownMessagesInActiveNarrow(state),
  flags: state.flags,
  allMessages: state.chat.messages,
  fetching: state.chat.fetching,
  caughtUp: state.chat.caughtUp,
  narrow: state.chat.narrow,
  mute: state.mute,
  typingUsers: getCurrentTypingUsers(state),
  anchor: getAnchor(state),
  users: state.users,
  readIds: state.flags.read
}), boundActions)(MainScreenContainer);
