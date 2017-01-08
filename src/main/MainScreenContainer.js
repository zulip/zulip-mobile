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
    fetchMessages(auth, Number.MAX_SAFE_INTEGER, 50, 0, narrow);
    focusPing(auth, true, false);
  }

  fetchOlder = () => {
    const { auth, isFetching, startReached, narrow, pointer, fetchMessages } = this.props;
    if (!isFetching && !startReached.includes(JSON.stringify(narrow))) {
      fetchMessages(auth, pointer[0], 25, 0, narrow);
    }
  }

  fetchNewer = () => {
    const { auth, isFetching, pointer, narrow, caughtUp, fetchMessages } = this.props;
    if (!isFetching && !caughtUp) {
      fetchMessages(auth, pointer[1], 0, 25, narrow);
    }
  }

  doNarrow = (newNarrow = [], pointer: number = Number.MAX_SAFE_INTEGER) => {
    const { auth, fetchMessages } = this.props;
    fetchMessages(auth, pointer, 25, 0, newNarrow);
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
  isFetching: state.chat.fetching > 0,
  narrow: state.chat.narrow,
  startReached: state.chat.startReached,
  pointer: getPointer(state),
  caughtUp: state.chat.caughtUp,
  streamlistOpened: state.nav.opened,
});

export default connect(mapStateToProps, boundActions)(MainScreenContainer);
