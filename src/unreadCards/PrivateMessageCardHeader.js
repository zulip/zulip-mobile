/* @flow */
import React, { PureComponent } from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { IconPrivateChat } from '../common/Icons';
import StreamUnreadCount from './StreamUnreadCount';

const styles = StyleSheet.create({
  header: {
    justifyContent: 'space-between',
    backgroundColor: '#020202',
    padding: 8,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    color: '#FFF',
    fontSize: 16,
    marginLeft: 5,
  },
  icon: {
    color: '#FFF',
  },
  streamHeading: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

const Heading = ({ text }) =>
  <View style={styles.streamHeading}>
    <IconPrivateChat size={16} style={styles.icon} />
    <Text style={styles.headerText}>
      {text}
    </Text>
  </View>;

export default class PrivateMessageCardHeader extends PureComponent {
  render() {
    const { unreadCount, sender } = this.props;

    return (
      <View style={styles.header}>
        <Heading text={sender} />
        <StreamUnreadCount count={unreadCount} />
      </View>
    );
  }
}
