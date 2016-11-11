import React from 'react';
import {
  AppState,
  StatusBar,
} from 'react-native';
import Drawer from 'react-native-drawer';
import { connect } from 'react-redux';

import boundActions from '../boundActions';
import { getAuth } from '../account/accountSelectors';
import StreamView from '../stream/StreamView';
import MainNavBar from '../nav/MainNavBar';
import OfflineNotice from './OfflineNotice';
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
    const { auth, narrow, getEvents,
      sendInitialGetUsers, appActivity, sendGetMessages } = this.props;

    getEvents(auth);

    // We use requestAnimationFrame to force this to happen in the next
    // iteration of the event loop. This ensures that the last action ends
    // before the new action begins and makes the debug output clearer.
    requestAnimationFrame(() => {
      sendInitialGetUsers(auth);
      appActivity(auth);
      sendGetMessages(auth, Number.MAX_SAFE_INTEGER, 10, 10, narrow);
    });
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this.handleAppStateChange);
  }

  fetchOlder = () => {
    const { auth, fetching, narrow, pointer, sendGetMessages } = this.props;
    if (!fetching) {
      sendGetMessages(auth, pointer[0], 10, 0, narrow);
    }
  }

  fetchNewer = () => {
    const { auth, fetching, pointer, narrow, caughtUp, sendGetMessages } = this.props;
    if (!fetching && !caughtUp) {
      sendGetMessages(auth, pointer[1], 0, 10, narrow);
    }
  }

  narrow = (narrowOperator, pointer: number = Number.MAX_SAFE_INTEGER, messages = []) => {
    const { auth, sendSetMessages, sendGetMessages } = this.props;
    sendSetMessages(messages);
    requestAnimationFrame(() =>
      sendGetMessages(auth, pointer, 10, 10, narrowOperator || {})
    );
  }

  render() {
    const { auth, messages, subscriptions, streamlistOpened, caughtUp, isOnline,
      openStreamSidebar, closeStreamSidebar } = this.props;

    return (
      <Drawer
        content={
          <StreamSidebar
            subscriptions={subscriptions}
            narrow={this.narrow}
          />
        }
        open={streamlistOpened}
        onOpenStart={openStreamSidebar}
        onClose={closeStreamSidebar}
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
              closeStreamSidebar : openStreamSidebar
            }
          >
            {!isOnline && <OfflineNotice />}
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

export default connect(
  (state) => ({
    auth: getAuth(state),
    isOnline: state.app.get('isOnline'),
    subscriptions: state.subscriptions,
    messages: state.stream.messages,
    fetching: state.stream.fetching,
    narrow: state.stream.narrow,
    pointer: state.stream.pointer,
    caughtUp: state.stream.caughtUp,
    streamlistOpened: state.nav.opened,
  }),
  boundActions,
)(MainScreen);
