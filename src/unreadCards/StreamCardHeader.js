/* @flow */
import React, { PureComponent } from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { IconStream, IconPrivateChat } from '../common/Icons';
import StreamUnreadCount from './StreamUnreadCount';

const PRIVATE_CHAT_COLOR = '#020202';

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

const StreamHeading = ({ isPrivate, stream }) =>
  <View style={styles.streamHeading}>
    {isPrivate
      ? <IconPrivateChat size={16} style={styles.icon} />
      : <IconStream size={16} style={styles.icon} />}
    <Text style={styles.headerText}>
      {stream}
    </Text>
  </View>;

export default class StreamCardHeader extends PureComponent {
  getHeaderStyles = () => [
    styles.header,
    { backgroundColor: this.props.color || PRIVATE_CHAT_COLOR },
  ];

  render() {
    const { isPrivate, sender, streamName, color, unreadCount } = this.props;

    return (
      <View style={this.getHeaderStyles()}>
        <StreamHeading isPrivate={isPrivate} stream={streamName || sender} />
        <StreamUnreadCount count={unreadCount} />
      </View>
    );
  }
}
