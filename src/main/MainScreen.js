import React from 'react';
import { StyleSheet } from 'react-native';
import ScrollableTabView from 'react-native-scrollable-tab-view';

import MainTabBar from './MainTabBar';
import HomeTab from './HomeTab';
import StreamListContainer from '../streamlist/StreamListContainer';
import UserListContainer from '../userlist/UserListContainer';
import AccountContainer from './AccountContainer';

const styles = StyleSheet.create({
  main: {
  },
  tabView: {
    flex: 1,
    backgroundColor: 'red',
  },
});

export default class MainScreen extends React.Component {
  render() {
    return (
      <ScrollableTabView
        style={styles.main}
        renderTabBar={() => <MainTabBar />}
      >
        <HomeTab />
        <StreamListContainer />
        <UserListContainer />
        <AccountContainer />
      </ScrollableTabView>
    );
  }
}
