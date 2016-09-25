import React from 'react';
import {
  StatusBar,
} from 'react-native';

import Drawer from 'react-native-drawer';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import {
  getMessages,
  setMessages,
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
  componentDidMount() {
    this.props.getEvents(this.props.account);

    // We use requestAnimationFrame to force this to happen in the next
    // iteration of the event loop. This ensures that the last action ends
    // before the new action begins and makes the debug output clearer.
    requestAnimationFrame(() =>
      this.props.getMessages(
        this.props.account,
        Number.MAX_SAFE_INTEGER,
        10,
        10,
        this.props.narrow
      )
    );
  }

  fetchOlder() {
    if (!this.props.fetching) {
      this.props.getMessages(
        this.props.account,
        this.props.pointer[0],
        10,
        0,
        this.props.narrow,
      );
    }
  }

  fetchNewer() {
    if (!this.props.fetching && !this.props.caughtUp) {
      this.props.getMessages(
        this.props.account,
        this.props.pointer[1],
        0,
        10,
        this.props.narrow,
      );
    }
  }

  narrow(narrowOperator, pointer=Number.MAX_SAFE_INTEGER, messages=[]) {
    this.props.setMessages(messages);
    requestAnimationFrame(() =>
      this.props.getMessages(
        this.props.account,
        pointer,
        10,
        10,
        narrowOperator? narrowOperator : {},
      )
    );
  }

  render() {
    return (
      <Drawer
        content={
          <ZulipStreamSidebar
            subscriptions={this.props.subscriptions}
            narrow={this.narrow.bind(this)}
          />
        }
        open={this.props.streamlistOpened}
        onOpenStart={this.props.openStreamSidebar}
        onClose={this.props.closeStreamSidebar}
        tapToClose={true}
        openDrawerOffset={100}
        negotiatePan={true}
        panOpenMask={0.5}
        useInteractionManager={true}
        tweenDuration={150}
        tweenHandler={Drawer.tweenPresets.parallax}
        side={"left"}
      >
      <Drawer
        content={<UserListContainer />}
        openDrawerOffset={100}
        negotiatePan={true}
        panOpenMask={0.5}
        useInteractionManager={true}
        tweenDuration={150}
        tweenHandler={Drawer.tweenPresets.parallax}
        side={"right"}
      >
        <StatusBar
          animated={true}
          showHideTransition={"slide"}
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
            email={this.props.account.email}
            caughtUp={this.props.caughtUp}
            fetchOlder={this.fetchOlder.bind(this)}
            fetchNewer={this.fetchNewer.bind(this)}
            narrow={this.narrow.bind(this)}
          />
          <ZulipComposeView />
        </ZulipNavBar>
      </Drawer>
      </Drawer>
    );
  }
};

const mapStateToProps = (state) => ({
  account: state.user.accounts.get(state.user.activeAccountId),
  subscriptions: state.realm.subscriptions,
  messages: state.stream.messages,
  fetching: state.stream.fetching,
  narrow: state.stream.narrow,
  pointer: state.stream.pointer,
  caughtUp: state.stream.caughtUp,
  streamlistOpened: state.nav.opened,
});

const mapDispatchToProps = (dispatch, ownProps) =>
  bindActionCreators({
    getMessages,
    setMessages,
    getEvents,
    openStreamSidebar,
    closeStreamSidebar,
  }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(ZulipMainView);
