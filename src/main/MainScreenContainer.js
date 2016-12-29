import React from 'react';
import { connect } from 'react-redux';

import boundActions from '../boundActions';
import { getMessagesInActiveNarrow, getAnchor } from '../chat/chatSelectors';
import { getAuth } from '../account/accountSelectors';
import MainScreen from './MainScreen';

class MainScreenContainer extends React.Component {

  fetchOlder = () => {
    const { auth, fetching, caughtUp, anchor, narrow, fetchMessages } = this.props;
    if (!fetching.older && !caughtUp.older && anchor) {
      fetchMessages(auth, anchor.older, 20, 0, narrow);
    }
  }

  fetchNewer = () => {
    const { auth, fetching, caughtUp, anchor, narrow, fetchMessages } = this.props;
    if (!fetching.newer && !caughtUp.newer && anchor) {
      fetchMessages(auth, anchor.newer, 0, 20, narrow);
    }
  }

  doNarrow = (newNarrow = [], anchor: number = Number.MAX_SAFE_INTEGER) => {
    const { switchNarrow, messages } = this.props;
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
