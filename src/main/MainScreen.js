/* @flow */
import React, { PureComponent } from 'react';

import type { Actions } from '../types';
import Chat from '../chat/Chat';
import MainNavBar from '../nav/MainNavBar';
import SideDrawer from './SideDrawer';
import StreamSidebar from '../nav/StreamSidebar';
import ConversationsContainer from '../conversations/ConversationsContainer';

export default class MainScreen extends PureComponent {
  props: {
    actions: Actions,
    orientation: string,
  };

  state: {
    leftDrawerOpen: boolean,
    rightDrawerOpen: boolean,
  };

  state = {
    leftDrawerOpen: false,
    rightDrawerOpen: false,
  };

  render() {
    const { actions, orientation } = this.props;
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
            actions={actions}
            onNarrow={newNarrow => {
              actions.doNarrow(newNarrow);
              this.setState({ leftDrawerOpen: false });
            }}
          />
        }>
        <SideDrawer
          side="right"
          open={rightDrawerOpen}
          orientation={orientation}
          onOpenStart={() => this.setState({ rightDrawerOpen: true })}
          onClose={() => this.setState({ rightDrawerOpen: false })}
          content={
            <ConversationsContainer
              onNarrow={newNarrow => {
                actions.doNarrow(newNarrow);
                this.setState({ rightDrawerOpen: false });
              }}
            />
          }>
          <MainNavBar
            onPressPeople={() => this.setState({ rightDrawerOpen: true })}
            onPressStreams={() => this.setState({ leftDrawerOpen: true })}
            cancelEditMessage={actions.cancelEditMessage}>
            <Chat />
          </MainNavBar>
        </SideDrawer>
      </SideDrawer>
    );
  }
}
