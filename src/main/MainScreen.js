import React from 'react';
import { StatusBar } from 'react-native';
import Drawer from 'react-native-drawer';

import { homeNarrow, specialNarrow } from '../utils/narrow';
import { focusPing } from '../api';
import Chat from '../chat/Chat';
import MainNavBar from '../nav/MainNavBar';
import StreamSidebar from '../nav/StreamSidebar';
import ConversationsContainer from '../conversations/ConversationsContainer';

export default class MainScreen extends React.Component {

  componentDidMount() {
    const { auth, fetchEvents, fetchUsersAndStatus,
      backgroundFetchMessages, fetchMessages } = this.props;

    fetchEvents(auth);
    fetchUsersAndStatus(auth);
    fetchMessages(auth, Number.MAX_SAFE_INTEGER, 20, 0, homeNarrow(), [true, true]);
    backgroundFetchMessages(auth, Number.MAX_SAFE_INTEGER, 100, 0, specialNarrow('private'));
    focusPing(auth, true, false);
  }

  render() {
    const { streamlistOpened, doNarrow } = this.props;

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
        openDrawerOffset={88}
        negotiatePan
        panOpenMask={0.5}
        useInteractionManager
        tweenDuration={150}
        tweenHandler={(ratio) => ({
          mainOverlay: {
            opacity: ratio / 2,
            backgroundColor: 'black',
          }
        })}
        side="left"
      >
        <Drawer
          content={
            <ConversationsContainer
              onNarrow={newNarrow => {
                if (newNarrow) doNarrow(newNarrow);
                this.peopleDrawer.close();
              }}
            />
          }
          ref={(peopleDrawer) => { this.peopleDrawer = peopleDrawer; }}
          openDrawerOffset={88}
          tapToClose
          negotiatePan
          panOpenMask={0.5}
          useInteractionManager
          tweenDuration={150}
          tweenHandler={(ratio) => ({
            mainOverlay: {
              opacity: ratio / 2,
              backgroundColor: 'black',
            }
          })}
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
