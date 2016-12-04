import React from 'react';
import { connect } from 'react-redux';

import boundActions from '../boundActions';
import { focusPing } from '../api';
import { getPointer } from '../chat/chatSelectors';
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
    fetchMessages(auth, Number.MAX_SAFE_INTEGER, 10, 10, narrow);
    fetchEvents(auth);
    focusPing(auth, true, false);
  }

  render() {
    return (
      <MainScreen {...this.props} />
    );
  }
}

const mapStateToProps = (state) => ({
  auth: getAuth(state),
  isOnline: state.app.isOnline,
  subscriptions: state.subscriptions,
  messages: state.messages,
  fetching: state.chat.fetching,
  narrow: state.chat.narrow,
  pointer: getPointer(state),
  caughtUp: state.chat.caughtUp,
  streamlistOpened: state.nav.opened,
});

export default connect(mapStateToProps, boundActions)(MainScreenContainer);
