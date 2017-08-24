/* @flow */
import React, { PureComponent } from 'react';
import { View, Text, StyleSheet } from 'react-native';

import TopicUnreadCount from './TopicUnreadCount';

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 6,
    paddingLeft: 8,
    paddingRight: 8,
    backgroundColor: '#EDE4E4',
    alignItems: 'center',
  },
});

export default class TopicCardHeader extends PureComponent {
  props: {
    unreadCount: number,
    heading: string,
  };

  render() {
    const { unreadCount, heading } = this.props;

    return (
      <View style={styles.header}>
        <Text>
          {heading}
        </Text>
        <TopicUnreadCount count={unreadCount} />
      </View>
    );
  }
};
