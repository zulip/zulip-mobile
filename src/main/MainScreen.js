import React from 'react';
import {
  StatusBar,
} from 'react-native';
import Drawer from 'react-native-drawer';

import { OfflineNotice } from '../common';
import MessageList from '../message-list/MessageList';
import MainNavBar from '../nav/MainNavBar';
import StreamSidebar from '../nav/StreamSidebar';
import ComposeBox from '../compose/ComposeBox';
import UserListContainer from '../userlist/UserListContainer';

export default class MainScreen extends React.Component {

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
    const { auth, sendGetMessages } = this.props;
    sendGetMessages(auth, pointer, 10, 10, narrowOperator || {});
  }

  render() {
    const { auth, messages, subscriptions, streamlistOpened, caughtUp, isOnline, twentyFourHourTime,
      openStreamSidebar, closeStreamSidebar } = this.props;

    return (
      <Drawer
        content={
          <StreamSidebar
            subscriptions={subscriptions}
            narrow={this.narrow}
          />
        }
        ref={
          (streamDrawer) => { this.streamDrawer = streamDrawer; }
        }
        open={streamlistOpened}
        onOpenStart={openStreamSidebar}
        onClose={closeStreamSidebar}
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
          content={<UserListContainer narrow={this.narrow} />}
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
            <MessageList
              messages={messages}
              twentyFourHourTime={twentyFourHourTime}
              subscriptions={subscriptions}
              auth={auth}
              caughtUp={caughtUp}
              fetchOlder={this.fetchOlder}
              fetchNewer={this.fetchNewer}
              narrow={this.narrow}
            />
            <ComposeBox onSend={this.sendMessage} />
          </MainNavBar>
        </Drawer>
      </Drawer>
    );
  }
}
