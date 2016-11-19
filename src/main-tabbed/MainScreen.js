import React from 'react';
import ScrollableTabView from 'react-native-scrollable-tab-view';

import MainTabBar from './MainTabBar';
import HomeTab from './HomeTab';
import StreamListContainer from '../streamlist/StreamListContainer';
import UserListContainer from '../userlist/UserListContainer';
import AccountContainer from '../account-info/AccountContainer';

export default class MainScreen extends React.Component {
  render() {
    return (
      <ScrollableTabView
        renderTabBar={() => <MainTabBar />}
      >
        <HomeTab />
        <StreamListContainer narrow={this.props.narrow} />
        <UserListContainer />
        <AccountContainer />
      </ScrollableTabView>
    );
  }
}
