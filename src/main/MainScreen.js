import React from 'react';
import {
  StatusBar,
} from 'react-native';
import Drawer from 'react-native-drawer';

import { OfflineNotice } from '../common';
import MessageList from '../message-list/MessageList';
import LoadingRow from '../message/LoadingRow';
import MainNavBar from '../nav/MainNavBar';
import StreamSidebar from '../nav/StreamSidebar';
import ComposeBox from '../compose/ComposeBox';
import UserListContainer from '../userlist/UserListContainer';

export default class MainScreen extends React.Component {

  fetchOlder = () => {
    const { auth, fetching, narrow, pointer, fetchMessages } = this.props;
    if (!fetching) {
      fetchMessages(auth, pointer[0], 10, 0, narrow);
    }
  }

  fetchNewer = () => {
    const { auth, fetching, pointer, narrow, caughtUp, fetchMessages } = this.props;
    if (!fetching && !caughtUp) {
      fetchMessages(auth, pointer[1], 0, 10, narrow);
    }
  }

  doNarrow = (narrowOperator, pointer: number = Number.MAX_SAFE_INTEGER, messages = []) => {
    const { auth, fetchMessages } = this.props;
    fetchMessages(auth, pointer, 10, 10, narrowOperator || {});
  }

  render() {
    const { auth, messages, narrow, fetching, subscriptions, streamlistOpened,
      caughtUp, isOnline, twentyFourHourTime } = this.props;

    return (
      <Drawer
        content={
          <StreamSidebar
            subscriptions={subscriptions}
            doNarrow={this.doNarrow}
          />
        }
        ref={(streamDrawer) => { this.streamDrawer = streamDrawer; }}
        open={streamlistOpened}
        tapToClose
        openDrawerOffset={40}
        negotiatePan
        panOpenMask={0.5}
        useInteractionManager
        tweenDuration={150}
        tweenHandler={Drawer.tweenPresets.parallax}
        side="left"
      >
        <Drawer
          content={<UserListContainer doNarrow={this.doNarrow} />}
          ref={(peopleDrawer) => { this.peopleDrawer = peopleDrawer; }}
          openDrawerOffset={40}
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
            onPressPeople={() => this.peopleDrawer.open()}
            openStreamList={() => this.streamDrawer.open()}
          >
            {!isOnline && <OfflineNotice />}
            {fetching && <LoadingRow />}
            <MessageList
              messages={messages}
              narrow={narrow}
              twentyFourHourTime={twentyFourHourTime}
              subscriptions={subscriptions}
              auth={auth}
              caughtUp={caughtUp}
              fetchOlder={this.fetchOlder}
              fetchNewer={this.fetchNewer}
              doNarrow={this.doNarrow}
            />
            <ComposeBox onSend={this.sendMessage} />
          </MainNavBar>
        </Drawer>
      </Drawer>
    );
  }
}
