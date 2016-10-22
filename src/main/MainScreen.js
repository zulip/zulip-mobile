import React from 'react';
import {
  AppState,
  StatusBar,
} from 'react-native';

import Drawer from 'react-native-drawer';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { getAuth } from '../accountlist/accountlistSelectors';

import { sendInitialGetUsers } from '../userlist/userListActions';
import { appActivity } from '../account/appActions';
import { sendGetMessages, sendSetMessages } from '../stream/streamActions';
import { getEvents } from '../events/eventActions';
import { openStreamSidebar, closeStreamSidebar } from '../nav/navActions';

import StreamView from '../stream/StreamView';
import MainNavBar from '../nav/MainNavBar';
import StreamSidebar from '../nav/StreamSidebar';
import ComposeView from '../compose/ComposeView';
import UserListContainer from '../userlist/UserListContainer';

class MainScreen extends React.Component {

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
    const { auth, messages, subscriptions, streamlistOpened, caughtUp } = this.props;

    return (
      <Drawer
        content={
          <StreamSidebar
            subscriptions={subscriptions}
            narrow={this.narrow}
          />
        }
        open={streamlistOpened}
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
            barStyle="light-content"
            showHideTransition="slide"
            hidden={streamlistOpened}
          />
          <MainNavBar
            onPressLeft={
              streamlistOpened ?
              this.props.closeStreamSidebar : this.props.openStreamSidebar
            }
          >
            <StreamView
              messages={messages}
              subscriptions={subscriptions}
              auth={auth}
              caughtUp={caughtUp}
              fetchOlder={this.fetchOlder}
              fetchNewer={this.fetchNewer}
              narrow={this.narrow}
            />
            <ComposeView />
          </MainNavBar>
        </Drawer>
      </Drawer>
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

export default connect(mapStateToProps, mapDispatchToProps)(MainScreen);
