import React from 'react';
import { connect } from 'react-redux';

import boundActions from '../boundActions';
import { registerAppActivity } from '../utils/activity';
import { getMessagesInActiveNarrow, getAnchor } from '../chat/chatSelectors';
import { getAuth } from '../account/accountSelectors';
import MainScreen from './MainScreen';

class MainScreenContainer extends React.Component {

  fetchOlder = () => {
    const { auth, fetching, caughtUp, anchor, narrow, fetchMessages } = this.props;
    if (!fetching.older && !caughtUp.older && anchor) {
      fetchMessages(auth, anchor.older, 50, 0, narrow);
    }
  }

  fetchNewer = () => {
    const { auth, fetching, caughtUp, anchor, narrow, fetchMessages } = this.props;
    if (!fetching.newer && !caughtUp.newer && anchor) {
      fetchMessages(auth, anchor.newer, 0, 50, narrow);
    }
  }

  doNarrow = (newNarrow = [], anchor: number = Number.MAX_SAFE_INTEGER) => {
    const { auth, switchNarrow, messages } = this.props;
    registerAppActivity(auth);
    requestIdleCallback(() =>
      switchNarrow(newNarrow, messages.filter(msg => msg.id === anchor)
    ));
  }

  markAsRead = (messages) => {
    const { auth, updateMessageFlags } = this.props;

    if (messages.length > 0) {
      for (const message of messages) {
        // NOTE: Mutating state like this is a BAD IDEA!
        // We're only doing it here because:
        // 1) The message flags don't affect rendering
        // 2) We don't want to update flags multiple times for the same message
        //    and updating state this frequently would be inefficient
        if (!message.flags) message.flags = [];
        message.flags.push('read');
      }
      updateMessageFlags(auth, messages.map((msg) => msg.id), 'add', 'read');
    }
  }

  render() {
    return (
      <MainScreen
        fetchOlder={this.fetchOlder}
        fetchNewer={this.fetchNewer}
        doNarrow={this.doNarrow}
        markAsRead={this.markAsRead}
        {...this.props}
      />
    );
  }
}

export default connect((state) => ({
  auth: getAuth(state),
  isOnline: state.app.isOnline,
  orientation: state.app.orientation,
  subscriptions: state.subscriptions,
  messages: getMessagesInActiveNarrow(state),
  allMessages: state.chat.messages,
  fetching: state.chat.fetching,
  caughtUp: state.chat.caughtUp,
  narrow: state.chat.narrow,
  mute: state.mute,
  anchor: getAnchor(state),
}), boundActions)(MainScreenContainer);
