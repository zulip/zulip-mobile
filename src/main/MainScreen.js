/* @flow */
import React from 'react';

import type { Actions, Message } from '../types';
import Chat from '../chat/Chat';
import MainNavBar from '../nav/MainNavBar';
import SideDrawer from './SideDrawer';
import StreamSidebar from '../nav/StreamSidebar';
import ConversationsContainer from '../conversations/ConversationsContainer';

export default class MainScreen extends React.Component {
  props: {
    actions: Actions,
    messages: Message[],
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
    const { actions, messages, orientation } = this.props;
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
            <Chat messages={messages} />
          </MainNavBar>
        </SideDrawer>
      </SideDrawer>
    );
  }
}
