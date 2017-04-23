import React from 'react';
import { connect } from 'react-redux';
import isEqual from 'lodash.isequal';

import config from '../config';
import boundActions from '../boundActions';
import { getMessagesInActiveNarrow, getAnchor } from '../chat/chatSelectors';
import { getAuth } from '../account/accountSelectors';
import MainScreen from './MainScreen';

class MainScreenContainer extends React.Component {
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
  messages: getMessagesInActiveNarrow(state),
  flags: state.flags,
  allMessages: state.chat.messages,
  fetching: state.chat.fetching,
  caughtUp: state.chat.caughtUp,
  narrow: state.chat.narrow,
  mute: state.mute,
  anchor: getAnchor(state),
  users: state.users,
}), boundActions)(MainScreenContainer);
