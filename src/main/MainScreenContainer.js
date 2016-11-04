import React from 'react';
import {
  AppState,
} from 'react-native';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { getAuth } from '../accountlist/accountlistSelectors';
import { sendInitialGetUsers } from '../userlist/userListActions';
import { appActivity } from '../account/appActions';
import { sendGetMessages, sendSetMessages } from '../stream/streamActions';
import { getEvents } from '../events/eventActions';
import { openStreamSidebar, closeStreamSidebar } from '../nav/navActions';
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
    const { auth, narrow } = this.props;

    this.props.getEvents(auth);

    // We use requestAnimationFrame to force this to happen in the next
    // iteration of the event loop. This ensures that the last action ends
    // before the new action begins and makes the debug output clearer.
    requestAnimationFrame(() => {
      this.props.sendInitialGetUsers(auth);
      this.props.appActivity(auth);
      this.props.sendGetMessages(auth, Number.MAX_SAFE_INTEGER, 10, 10, narrow);
    });
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this.handleAppStateChange);
  }

  render() {
    return (
      <MainScreen />
    );
  }
}


const mapStateToProps = (state) => ({
  auth: getAuth(state),
  subscriptions: state.subscriptions,
  messages: state.stream.messages,
  fetching: state.stream.fetching,
  narrow: state.stream.narrow,
  pointer: state.stream.pointer,
  caughtUp: state.stream.caughtUp,
  streamlistOpened: state.nav.opened,
});

const mapDispatchToProps = (dispatch, ownProps) =>
  bindActionCreators({
    appActivity,
    sendInitialGetUsers,
    sendGetMessages,
    sendSetMessages,
    getEvents,
    openStreamSidebar,
    closeStreamSidebar,
  }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(MainScreenContainer);
