import React from 'react';
import {
  AppState,
  StatusBar,
} from 'react-native';

import Drawer from 'react-native-drawer';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import {
  sendGetUsers,
} from '../userlist/userListActions';

import {
  appActivity,
} from '../account/appActions';

import {
  sendGetMessages,
  sendSetMessages,
} from '../stream/streamActions';

import {
  getEvents,
} from '../events/eventActions';

import {
  openStreamSidebar,
  closeStreamSidebar,
} from '../nav/navActions';

import StreamView from '../stream/StreamView';
import NavBar from '../nav/NavBar';
import StreamSidebar from '../nav/StreamSidebar';
import ComposeView from '../compose/ComposeView';
import UserListContainer from '../userlist/UserListContainer';

class MainScreen extends React.Component {

  // props: {
  //   auth: Auth,
  //   subscriptions: state.subscriptions,
  //   messages: state.stream.messages,
  //   fetching: state.stream.fetching,
  //   narrow: state.stream.narrow,
  //   pointer: state.stream.pointer,
  //   caughtUp: state.stream.caughtUp,
  //   streamlistOpened: state.nav.opened,
  // }

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
      this.props.sendGetUsers(auth, true, false);
      this.props.appActivity(auth);
      this.props.sendGetMessages(auth, Number.MAX_SAFE_INTEGER, 10, 10, narrow);
    });
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this.handleAppStateChange);
  }

  fetchOlder = () => {
    if (!this.props.fetching) {
      this.props.sendGetMessages(
        this.props.auth,
        this.props.pointer[0],
        10,
        0,
        this.props.narrow,
      );
    }
  }

  fetchNewer = () => {
    if (!this.props.fetching && !this.props.caughtUp) {
      this.props.sendGetMessages(
        this.props.auth,
        this.props.pointer[1],
        0,
        10,
        this.props.narrow,
      );
    }
  }

  narrow = (narrowOperator, pointer: number = Number.MAX_SAFE_INTEGER, messages = []) => {
    this.props.sendSetMessages(messages);
    requestAnimationFrame(() =>
      this.props.sendGetMessages(
        this.props.auth,
        pointer,
        10,
        10,
        narrowOperator || {},
      )
    );
  }

  render() {
    return (
      <Drawer
        content={
          <StreamSidebar
            subscriptions={this.props.subscriptions}
            narrow={this.narrow}
          />
        }
        open={this.props.streamlistOpened}
        onOpenStart={this.props.openStreamSidebar}
        onClose={this.props.closeStreamSidebar}
        tapToClose
        openDrawerOffset={100}
        negotiatePan
        panOpenMask={0.5}
        useInteractionManager
        tweenDuration={150}
        tweenHandler={Drawer.tweenPresets.parallax}
        side="left"
      >
        <Drawer
          content={<UserListContainer narrow={this.narrow} />}
          openDrawerOffset={100}
          tapToClose
          negotiatePan
          panOpenMask={0.5}
          useInteractionManager
          tweenDuration={150}
          tweenHandler={Drawer.tweenPresets.parallax}
          side="right"
        >
          <StatusBar
            animated
            showHideTransition="slide"
            hidden={this.props.streamlistOpened}
          />
          <NavBar
            onPressLeft={
              this.props.streamlistOpened ?
              this.props.closeStreamSidebar : this.props.openStreamSidebar
            }
          >
            <StreamView
              messages={this.props.messages}
              subscriptions={this.props.subscriptions}
              email={this.props.auth.get('email')}
              caughtUp={this.props.caughtUp}
              fetchOlder={this.fetchOlder}
              fetchNewer={this.fetchNewer}
              narrow={this.narrow}
            />
            <ComposeView />
          </NavBar>
        </Drawer>
      </Drawer>
    );
  }
}

const mapStateToProps = (state) => ({
  auth: state.auth,
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
    sendGetUsers,
    sendGetMessages,
    sendSetMessages,
    getEvents,
    openStreamSidebar,
    closeStreamSidebar,
  }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(MainScreen);
