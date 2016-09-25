import React from 'react';
import Drawer from 'react-native-drawer';
import ZulipNavBar from './ZulipNavBar';
import ZulipStreamView from '../stream/ZulipStreamView';
import ZulipComposeBar from '../compose/ZulipComposeBar';
import UserListContainer from '../userlist/UserListContainer';

const MainView = () => (
  <Drawer
    type="overlay"
    ref={(ref) => this._drawer = ref}
    content={<UserListContainer />}
  >
    <ZulipNavBar>
      <ZulipStreamView />
      <ZulipComposeBar />
    </ZulipNavBar>
  </Drawer>
);

export default MainView;
