/* @flow */
import React, { PureComponent } from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { IconStream } from '../common/Icons';
import StreamUnreadCount from './StreamUnreadCount';

const styles = StyleSheet.create({
  header: {
    justifyContent: 'space-between',
    backgroundColor: '#8999FF',
    padding: 8,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    color: '#FFF',
    fontSize: 16,
    marginLeft: 3,
  },
  icon: {
    color: '#FFF',
  },
  streamHeading: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

const StreamHeading = ({ stream }) =>
  <View style={styles.streamHeading}>
    <IconStream size={16} style={styles.icon} />
    <Text style={styles.headerText}>
      {stream}
    </Text>
  </View>;

export default class StreamCardHeader extends PureComponent {
  getHeaderStyles = () => [styles.header, { backgroundColor: this.props.color }];

  render() {
    const { streamName, color, unreadCount } = this.props;

    return (
      <View style={this.getHeaderStyles()}>
        <StreamHeading stream={streamName} />
        <StreamUnreadCount count={unreadCount} />
      </View>
    );
  }
}
