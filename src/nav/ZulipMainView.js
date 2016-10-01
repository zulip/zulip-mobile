import React from 'react';
import {
  StatusBar,
} from 'react-native';

import Drawer from 'react-native-drawer';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import {
  sendFocusPing,
  sendGetUsers,
} from '../userlist/userListActions';

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

import ZulipStreamView from '../stream/ZulipStreamView';
import ZulipNavBar from '../nav/ZulipNavBar';
import ZulipStreamSidebar from '../nav/ZulipStreamSidebar';
import ZulipComposeView from '../compose/ZulipComposeView';
import UserListContainer from '../userlist/UserListContainer';

class ZulipMainView extends React.Component {

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

  componentDidMount() {
    const { auth, narrow } = this.props;

    this.props.getEvents(auth);

    // We use requestAnimationFrame to force this to happen in the next
    // iteration of the event loop. This ensures that the last action ends
    // before the new action begins and makes the debug output clearer.
    requestAnimationFrame(() => {
      this.props.sendGetUsers(auth, true, false);
      this.props.sendFocusPing(auth, true, false);
      this.props.sendGetMessages(auth, Number.MAX_SAFE_INTEGER, 10, 10, narrow);
    });
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

  narrow = (narrowOperator, pointer = Number.MAX_SAFE_INTEGER, messages = []) => {
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
          <ZulipStreamSidebar
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
          content={<UserListContainer />}
          openDrawerOffset={100}
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
          <ZulipNavBar
            onPressLeft={
              this.props.streamlistOpened ?
              this.props.closeStreamSidebar : this.props.openStreamSidebar
            }
          >
            <ZulipStreamView
              messages={this.props.messages}
              subscriptions={this.props.subscriptions}
              email={this.props.auth.email}
              caughtUp={this.props.caughtUp}
              fetchOlder={this.fetchOlder}
              fetchNewer={this.fetchNewer}
              narrow={this.narrow}
            />
            <ZulipComposeView />
          </ZulipNavBar>
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
    sendFocusPing,
    sendGetUsers,
    sendGetMessages,
    sendSetMessages,
    getEvents,
    openStreamSidebar,
    closeStreamSidebar,
  }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(ZulipMainView);
