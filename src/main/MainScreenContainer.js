import React from 'react';
import { connect } from 'react-redux';
import isEqual from 'lodash.isequal';

import boundActions from '../boundActions';
import { focusPing } from '../api';
import { getMessages, getPointer } from '../chat/chatSelectors';
import { getAuth } from '../account/accountSelectors';
import MainScreen from './MainScreen';

class MainScreenContainer extends React.Component {

  state: {
    currentAppState: boolean,
  }

  componentDidMount() {
    const {
      auth, narrow, fetchEvents, fetchUsersAndStatus, fetchMessages,
    } = this.props;

    fetchUsersAndStatus(auth);
    fetchMessages(auth, Number.MAX_SAFE_INTEGER, 100, 0, narrow);
    fetchEvents(auth);
    focusPing(auth, true, false);
  }

  fetchOlder = () => {
    const { auth, fetching, narrow, pointer, fetchMessages } = this.props;
    if (!fetching) {
      fetchMessages(auth, pointer[0], 25, 0, narrow, false);
    }
  }

  fetchNewer = () => {
    const { auth, fetching, pointer, narrow, caughtUp, fetchMessages } = this.props;
    if (!fetching && !caughtUp) {
      fetchMessages(auth, pointer[1], 0, 25, narrow, false);
    }
  }

  doNarrow = (newNarrow = [], pointer: number = Number.MAX_SAFE_INTEGER) => {
    const { auth, fetchMessages, narrow } = this.props;
    fetchMessages(auth, pointer, 25, 0, newNarrow, !isEqual(narrow, newNarrow));
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
  messages: getMessages(state),
  fetching: state.chat.fetching,
  narrow: state.chat.narrow,
  pointer: getPointer(state),
  caughtUp: state.chat.caughtUp,
  streamlistOpened: state.nav.opened,
});

export default connect(mapStateToProps, boundActions)(MainScreenContainer);
