import React from 'react';
import { StatusBar } from 'react-native';

import Chat from '../chat/Chat';
import MainNavBar from '../nav/MainNavBar';
import SideDrawer from './SideDrawer';
import StreamSidebar from '../nav/StreamSidebar';
import ConversationsContainer from '../conversations/ConversationsContainer';

export default class MainScreen extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      leftDrawerOpen: false,
      rightDrawerOpen: false,
    };
  }

  render() {
    const { doNarrow, orientation, pushRoute } = this.props;
    const { leftDrawerOpen, rightDrawerOpen } = this.state;

    return (
      <SideDrawer
        side="left"
        open={leftDrawerOpen}
        orientation={orientation}
        onOpenStart={() => this.setState({ leftDrawerOpen: true })}
        onClose={() => this.setState({ leftDrawerOpen: false })}
        content={
          <StreamSidebar
            pushRoute={pushRoute}
            onNarrow={newNarrow => {
              doNarrow(newNarrow);
              this.setState({ leftDrawerOpen: false });
            }}
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
                doNarrow(newNarrow);
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
            pushRoute={pushRoute}
          >
            <Chat {...this.props} />
          </MainNavBar>
        </SideDrawer>
      </SideDrawer>
    );
  }
}
