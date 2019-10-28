/* @flow strict-local */
import React, { Component } from 'react';
import { StyleSheet } from 'react-native';
import ScrollableTabView from 'react-native-scrollable-tab-view';
import SubscriptionsCard from '../streams/SubscriptionsCard';
import StreamListCard from '../subscriptions/StreamListCard';

import { BRAND_COLOR } from '../styles/constants';

const styles = StyleSheet.create({
  tab: {
    padding: 8,
    fontSize: 16,
  },
});

export default class App extends Component {
  render() {
    return (
      <ScrollableTabView
        style={styles.tab}
        tabBarActiveTextColor={BRAND_COLOR}
        tabBarInactiveTextColor="#a9a9a9"
        tabBarUnderlineStyle={{ backgroundColor: BRAND_COLOR }}
      >
        <SubscriptionsCard tabLabel="Subscribed" />
        <StreamListCard tabLabel="All streams" />
      </ScrollableTabView>
    );
  }
}
