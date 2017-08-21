/* @flow */
import React, { PureComponent } from 'react';
import { View, Text, StyleSheet } from 'react-native';

import TopicCardHeader from './TopicCardHeader';
import ExtraUnreadCount from './ExtraUnreadCount';
import DummyMessage from './DummyMessage';

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
  },
});

export default class TopicCard extends PureComponent {
  render() {
    const { name, unreadCount } = this.props;

    return (
      <View style={styles.container}>
        <TopicCardHeader heading={name} unreadCount={unreadCount} />
        <DummyMessage />
        {unreadCount > 1 && <ExtraUnreadCount count={unreadCount - 1} />}
      </View>
    );
  }
}
