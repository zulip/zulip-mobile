import React from 'react';
import {
  StyleSheet,
  View,
  StatusBar,
} from 'react-native';

import { TabViewAnimated, TabBarTop } from 'react-native-tab-view';

import { BRAND_COLOR, NAVBAR_HEIGHT, STATUSBAR_HEIGHT } from '../common/styles';
import StreamListContainer from '../streamlist/StreamListContainer';
import UserListContainer from '../userlist/UserListContainer';
import AccountContainer from './AccountContainer';


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  page: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  page1: {
    backgroundColor: 'red',
  },
  page2: {
    backgroundColor: 'green',
  },
  tabBar: {
    height: 44 + STATUSBAR_HEIGHT,
    paddingTop: STATUSBAR_HEIGHT,
    backgroundColor: BRAND_COLOR,
  },
  title: {
    color: 'white',
    fontSize: 16,
    lineHeight: NAVBAR_HEIGHT,
  },
  button: {
    color: 'white',
    textAlign: 'center',
    fontSize: 26,
    padding: (NAVBAR_HEIGHT - 28) / 2,
    width: NAVBAR_HEIGHT,
  },
});

export default class MainScreen extends React.Component {

  state = {
    index: 0,
    routes: [
      { key: 'streams', title: 'Streams' },
      { key: 'people', title: 'People' },
      { key: 'account', title: 'Account' },
    ],
  };

  handleChangeTab = (index) => {
    this.setState({ index });
  };

  renderHeader = (props) =>
    <TabBarTop style={styles.tabBar} {...props} />;

  renderScene = ({ route }) => {
    switch (route.key) {
      case 'streams':
        return <StreamListContainer narrow={this.narrow} />;
      case 'people':
        return <UserListContainer narrow={this.narrow} />;
      case 'account':
        return <AccountContainer narrow={this.narrow} />;
      default:
        return null;
    }
  };

  render() {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={BRAND_COLOR} />
        <TabViewAnimated
          style={styles.container}
          navigationState={this.state}
          renderScene={this.renderScene}
          renderHeader={this.renderHeader}
          onRequestChangeTab={this.handleChangeTab}
        />
      </View>
    );
  }
}
