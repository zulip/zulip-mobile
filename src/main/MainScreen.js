import React from 'react';
import Drawer from 'react-native-drawer';

import Chat from '../chat/Chat';
import MainNavBar from '../nav/MainNavBar';
import StreamSidebar from '../nav/StreamSidebar';
import ConversationsContainer from '../conversations/ConversationsContainer';
import requestInitialServerData from './requestInitialServerData';
import { BRAND_COLOR } from '../common/styles';

export default class MainScreen extends React.Component {

  componentDidMount() {
    requestInitialServerData(this.props);
  }

  render() {
    const { streamlistOpened, doNarrow, narrow, subscriptions } = this.props;
    let color = BRAND_COLOR;
    if (narrow.length !== 0 && narrow[0].operator === 'stream') {
      color = (subscriptions.find((sub) => narrow[0].operand === sub.name)).color;
    }

    return (
      <Drawer
        content={
          <StreamSidebar
            onNarrow={newNarrow => {
              doNarrow(newNarrow);
              this.streamDrawer.close();
            }}
            pushRoute={this.props.pushRoute}
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
          <MainNavBar
            onPressPeople={() => this.peopleDrawer.open()}
            openStreamList={() => this.streamDrawer.open()}
            backgroundColor={color}
          >
            <Chat {...this.props} />
          </MainNavBar>
        </Drawer>
      </Drawer>
    );
  }
}
