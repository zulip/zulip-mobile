import React from 'react';
import {
  StatusBar,
} from 'react-native';
import Drawer from 'react-native-drawer';

import DeviceInfo from 'react-native-device-info';

import Chat from '../chat/Chat';
import MainNavBar from '../nav/MainNavBar';
import StreamSidebar from '../nav/StreamSidebar';
import UserListContainer from '../userlist/UserListContainer';

export default class MainScreen extends React.Component {

  render() {
    const { streamlistOpened, doNarrow } = this.props;
    console.log('getModel', DeviceInfo.getModel());
    console.log('getSystemVersion', DeviceInfo.getSystemVersion());
    console.log('getVersion', DeviceInfo.getVersion());
    console.log('getUserAgent', DeviceInfo.getUserAgent());
    return (
      <Drawer
        content={
          <StreamSidebar
            onNarrow={newNarrow => {
              doNarrow(newNarrow);
              this.streamDrawer.close();
            }}
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
          content={
            <UserListContainer
              onNarrow={newNarrow => {
                doNarrow(newNarrow);
                this.peopleDrawer.close();
              }}
            />
          }
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
            <Chat {...this.props} />
          </MainNavBar>
        </Drawer>
      </Drawer>
    );
  }
}
