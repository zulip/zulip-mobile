import React from 'react';
import { StatusBar } from 'react-native';
import Drawer from 'react-native-drawer';

import Chat from '../chat/Chat';
import MainNavBar from '../nav/MainNavBar';
import StreamSidebar from '../nav/StreamSidebar';
import ConversationsContainer from '../conversations/ConversationsContainer';
import requestInitialServerData from './requestInitialServerData';
import { BRAND_COLOR } from '../common/styles';

const SideDrawer = (props) => {
  return (
    <Drawer
      content={props.content}
      ref={props.drawerRef}
      side={props.side}
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
      onOpenStart={() => StatusBar.setHidden(true, 'slide')}
      onClose={() => StatusBar.setHidden(false, 'slide')}
    >
      {props.children}
    </Drawer>
  );
};

export default class MainScreen extends React.Component {

  componentDidMount() {
    requestInitialServerData(this.props);
  }

  render() {
    const { doNarrow, narrow, subscriptions } = this.props;
    let color = BRAND_COLOR;
    if (narrow.length !== 0 && narrow[0].operator === 'stream') {
      color = (subscriptions.find((sub) => narrow[0].operand === sub.name)).color;
    }

    return (
      <SideDrawer
        side="left"
        drawerRef={(streamDrawer) => { this.streamDrawer = streamDrawer; }}
        content={
          <StreamSidebar
            onNarrow={newNarrow => {
              doNarrow(newNarrow);
              this.streamDrawer.close();
            }}
            pushRoute={this.props.pushRoute}
          />
        }
      >
        <SideDrawer
          side="right"
          drawerRef={(peopleDrawer) => { this.peopleDrawer = peopleDrawer; }}
          content={
            <ConversationsContainer
              onNarrow={newNarrow => {
                if (newNarrow) doNarrow(newNarrow);
                this.peopleDrawer.close();
              }}
            />
          }
        >
          <MainNavBar
            onPressPeople={() => this.peopleDrawer.open()}
            openStreamList={() => this.streamDrawer.open()}
            backgroundColor={color}
          >
            <Chat {...this.props} />
          </MainNavBar>
        </SideDrawer>
      </SideDrawer>
    );
  }
}
