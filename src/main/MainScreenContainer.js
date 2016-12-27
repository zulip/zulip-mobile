import React from 'react';
import { connect } from 'react-redux';

import boundActions from '../boundActions';
import { focusPing } from '../api';
import { getMessagesInActiveNarrow, getPointer } from '../chat/chatSelectors';
import { getAuth } from '../account/accountSelectors';
import MainScreen from './MainScreen';

class MainScreenContainer extends React.Component {

  componentDidMount() {
    const {
      auth, narrow, fetchEvents, fetchUsersAndStatus, fetchMessages,
    } = this.props;

    fetchEvents(auth);
    fetchUsersAndStatus(auth);
    fetchMessages(auth, Number.MAX_SAFE_INTEGER, 5, 0, narrow);
    fetchMessages(auth, Number.MAX_SAFE_INTEGER, 20, 0, narrow);
    focusPing(auth, true, false);
  }

  fetchOlder = () => {
    const { auth, isFetching, startReached, narrow, pointer, fetchMessages } = this.props;
    if (!isFetching && !startReached.includes(JSON.stringify(narrow))) {
      fetchMessages(auth, pointer[0], 20, 0, narrow);
    }
  }

  doNarrow = (newNarrow = [], pointer: number = Number.MAX_SAFE_INTEGER) => {
    const { auth, allMessages, fetchMessages, switchNarrow } = this.props;

    if (allMessages[JSON.stringify(newNarrow)]) {
      switchNarrow(newNarrow);
    } else {
      fetchMessages(auth, pointer, 20, 0, newNarrow);
    }
  }

  render() {
    return (
      <MainScreen
        fetchOlder={this.fetchOlder}
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
  isFetching: state.chat.fetching > 0,
  narrow: state.chat.narrow,
  startReached: state.chat.startReached,
  pointer: getPointer(state),
  streamlistOpened: state.nav.opened,
});

export default connect(mapStateToProps, boundActions)(MainScreenContainer);
