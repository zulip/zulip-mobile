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

  render() {
    const { auth, messages, narrow, fetching, subscriptions, streamlistOpened,
      caughtUp, isOnline, twentyFourHourTime, doNarrow, fetchOlder, fetchNewer } = this.props;

    return (
      <Drawer
        content={
          <StreamSidebar
            subscriptions={subscriptions}
            doNarrow={doNarrow}
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
          content={<UserListContainer doNarrow={doNarrow} />}
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
              fetchOlder={fetchOlder}
              fetchNewer={fetchNewer}
              doNarrow={doNarrow}
            />
            <ComposeBox onSend={this.sendMessage} />
          </MainNavBar>
        </Drawer>
      </Drawer>
    );
  }
}
