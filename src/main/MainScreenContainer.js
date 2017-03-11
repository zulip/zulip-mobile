import React from 'react';
import { connect } from 'react-redux';

import config from '../config';
import boundActions from '../boundActions';
import { registerAppActivity } from '../utils/activity';
import { getMessagesInActiveNarrow, getAnchor } from '../chat/chatSelectors';
import { getAuth } from '../account/accountSelectors';
import MainScreen from './MainScreen';

class MainScreenContainer extends React.Component {
  componentWillReceiveProps(nextProps) {
    const { auth, fetchMessages } = this.props;

    // Trigger a fetch when the current narrow is switched and there are no messages
    if (JSON.stringify(this.props.narrow) !== JSON.stringify(nextProps.narrow) &&
        nextProps.messages.length === 0) {
      fetchMessages(
        auth,
        0,
        config.messagesPerRequest / 2,
        config.messagesPerRequest / 2,
        nextProps.narrow,
        true
      );
    }
  }

  fetchOlder = () => {
    const { auth, fetching, caughtUp, anchor, narrow, fetchMessages } = this.props;
    if (!fetching.older && !caughtUp.older && anchor) {
      fetchMessages(auth, anchor.older, config.messagesPerRequest, 0, narrow);
    }
  }

  fetchNewer = () => {
    const { auth, fetching, caughtUp, anchor, narrow, fetchMessages } = this.props;
    if (!fetching.newer && !caughtUp.newer && anchor) {
      fetchMessages(auth, anchor.newer, 0, config.messagesPerRequest, narrow);
    }
  }

  doNarrow = (newNarrow = [], anchor: number = Number.MAX_SAFE_INTEGER) => {
    const { auth, switchNarrow, messages } = this.props;
    registerAppActivity(auth);
    requestIdleCallback(() =>
      switchNarrow(newNarrow, messages.filter(msg => msg.id === anchor)
    ));
  }

  render() {
    return (
      <MainScreen
        fetchOlder={this.fetchOlder}
        fetchNewer={this.fetchNewer}
        doNarrow={this.doNarrow}
        markAsRead={this.handleMarkAsRead}
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
  flags: state.flags,
  allMessages: state.chat.messages,
  fetching: state.chat.fetching,
  caughtUp: state.chat.caughtUp,
  narrow: state.chat.narrow,
  mute: state.mute,
  anchor: getAnchor(state),
}), boundActions)(MainScreenContainer);
