import React from 'react';
import { StatusBar } from 'react-native';
import Drawer from 'react-native-drawer';

import Chat from '../chat/Chat';
import MainNavBar from '../nav/MainNavBar';
import StreamSidebar from '../nav/StreamSidebar';
import ConversationsContainer from '../conversations/ConversationsContainer';
import { BRAND_COLOR } from '../common/styles';

const SideDrawer = (props) =>
  <Drawer
    content={props.content}
    open={props.open}
    side={props.side}
    tapToClose
    openDrawerOffset={
      props.orientation === 'LANDSCAPE' ? 0.5 : 0.2
    }
    negotiatePan
    panOpenMask={0.1}
    useInteractionManager
    tweenDuration={150}
    tweenHandler={(ratio) => ({
      mainOverlay: {
        opacity: ratio / 2,
        backgroundColor: 'black',
      }
    })}
    onOpenStart={props.onOpenStart}
    onClose={props.onClose}
  >
    {props.children}
  </Drawer>;

export default class MainScreen extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      leftDrawerOpen: false,
      rightDrawerOpen: false,
    };
  }

  render() {
    const { doNarrow, narrow, orientation, subscriptions } = this.props;
    const { leftDrawerOpen, rightDrawerOpen } = this.state;

    let color = BRAND_COLOR;
    if (narrow.length !== 0 && narrow[0].operator === 'stream') {
      color = (subscriptions.find((sub) => narrow[0].operand === sub.name)).color;
    }

    return (
      <SideDrawer
        side="left"
        open={leftDrawerOpen}
        orientation={orientation}
        onOpenStart={() => this.setState({ leftDrawerOpen: true })}
        onClose={() => this.setState({ leftDrawerOpen: false })}
        content={
          <StreamSidebar
            onNarrow={newNarrow => {
              doNarrow(newNarrow);
              this.setState({ leftDrawerOpen: false });
            }}
            pushRoute={this.props.pushRoute}
          />
        }
      >
        <SideDrawer
          side="right"
          open={rightDrawerOpen}
          orientation={orientation}
          onOpenStart={() => this.setState({ rightDrawerOpen: true })}
          onClose={() => this.setState({ rightDrawerOpen: false })}
          content={
            <ConversationsContainer
              onNarrow={newNarrow => {
                if (newNarrow) doNarrow(newNarrow);
                this.setState({ rightDrawerOpen: false });
              }}
            />
          }
        >
          <StatusBar
            animated
            showHideTransition="slide"
            hidden={orientation === 'LANDSCAPE' || leftDrawerOpen || rightDrawerOpen}
          />
          <MainNavBar
            onPressPeople={() => this.setState({ rightDrawerOpen: true })}
            onPressStreams={() => this.setState({ leftDrawerOpen: true })}
            backgroundColor={color}
          >
            <Chat {...this.props} />
          </MainNavBar>
        </SideDrawer>
      </SideDrawer>
    );
  }
}
