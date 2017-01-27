import React from 'react';
import { connect } from 'react-redux';

import boundActions from '../boundActions';
import { getMessagesInActiveNarrow, getPointer } from '../chat/chatSelectors';
import { getAuth } from '../account/accountSelectors';
import MainScreen from './MainScreen';

class MainScreenContainer extends React.Component {

  fetchOlder = () => {
    const { auth, fetching, caughtUp, pointer, narrow, fetchMessages } = this.props;
    if (!fetching[0] && !caughtUp[0]) {
      fetchMessages(auth, pointer[0], 20, 0, narrow, [true, false]);
    }
  }

  fetchNewer = () => {
    const { auth, fetching, caughtUp, pointer, narrow, fetchMessages } = this.props;
    if (!fetching[1] && !caughtUp[1]) {
      fetchMessages(auth, pointer[1], 0, 20, narrow, [false, true]);
    }
  }

  doNarrow = (newNarrow = [], pointer: number = Number.MAX_SAFE_INTEGER) => {
    const { auth, allMessages, fetchMessages, switchNarrow } = this.props;

    if (allMessages[JSON.stringify(newNarrow)]) {
      switchNarrow(newNarrow);
    } else {
      fetchMessages(auth, pointer, 10, 10, newNarrow, [true, true], [false, false]);
    }
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

const mapStateToProps = (state) => ({
  auth: getAuth(state),
  isOnline: state.app.isOnline,
  subscriptions: state.subscriptions,
  messages: getMessagesInActiveNarrow(state),
  allMessages: state.chat.messages,
  fetching: state.chat.fetching,
  caughtUp: state.chat.caughtUp,
  narrow: state.chat.narrow,
  pointer: getPointer(state),
  streamlistOpened: state.nav.opened,
});

export default connect(mapStateToProps, boundActions)(MainScreenContainer);
