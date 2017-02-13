import React from 'react';
import { StatusBar } from 'react-native';
import Drawer from 'react-native-drawer';

import Chat from '../chat/Chat';
import MainNavBar from '../nav/MainNavBar';
import StreamSidebar from '../nav/StreamSidebar';
import ConversationsContainer from '../conversations/ConversationsContainer';
import requestInitialServerData from './requestInitialServerData';
import { BRAND_COLOR } from '../common/styles';

const SideDrawer = (props) =>
  <Drawer
    content={props.content}
    open={props.open}
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
        open={this.state.leftDrawerOpen}
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
          open={this.state.rightDrawerOpen}
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
            hidden={this.state.leftDrawerOpen || this.state.rightDrawerOpen}
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
