import React from 'react';
import {
  StyleSheet,
  View,
  Text,
} from 'react-native';

import ScrollableTabView from 'react-native-scrollable-tab-view';
import { TabViewAnimated, TabBarTop } from 'react-native-tab-view';

import { BRAND_COLOR, NAVBAR_HEIGHT, STATUSBAR_HEIGHT } from '../common/styles';
import StreamListContainer from '../streamlist/StreamListContainer';
import UserListContainer from '../userlist/UserListContainer';

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
    height: 44,
    marginTop: STATUSBAR_HEIGHT,
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

export default class MainNavTabs extends React.Component {

  state = {
    index: 0,
    routes: [
      { key: '1', title: 'Streams' },
      { key: '2', title: 'People' },
    ],
  };

  handleChangeTab = (index) => {
    this.setState({ index });
  };

  renderHeader = (props) =>
    <TabBarTop style={styles.tabBar} {...props} />;

  renderScene = ({ route }) => {
    switch (route.key) {
      case '1':
        return <StreamListContainer narrow={this.narrow} />;
      case '2':
        return <UserListContainer narrow={this.narrow} />;
      default:
        return null;
    }
  };

  render() {
    return (
      <View style={styles.container}>
        {/* <ScrollableTabView>
          <Text tabLabel="Tab #1">My</Text>
          <Text tabLabel="Tab #2">favorite</Text>
          <Text tabLabel="Tab #3">project</Text>
        </ScrollableTabView> */}
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
