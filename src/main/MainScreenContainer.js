import React from 'react';
import {
  AppState,
} from 'react-native';
import { connect } from 'react-redux';

import boundActions from '../boundActions';
import { getPointer } from '../chat/chatSelectors';
import { getAuth } from '../account/accountSelectors';
import MainScreen from './MainScreen';

class MainScreenContainer extends React.Component {

  state: {
    currentAppState: boolean,
  }

  handleAppStateChange = (currentAppState) => {
    if (currentAppState === 'active') {
      this.props.appActivity();
    }
  }

  componentDidMount() {
    AppState.addEventListener('change', this.handleAppStateChange);

    const {
      auth, narrow, getEvents, sendInitialGetUsers, appActivity, sendGetMessages,
    } = this.props;

    getEvents(auth);
    sendInitialGetUsers(auth);
    appActivity(auth);
    sendGetMessages(auth, Number.MAX_SAFE_INTEGER, 10, 10, narrow);
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this.handleAppStateChange);
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
