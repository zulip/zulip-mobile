/* @flow */
import React, { PureComponent } from 'react';
import { View, Text, StyleSheet } from 'react-native';

import TopicCardHeader from './TopicCardHeader';
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
      </View>
    );
  }
}
