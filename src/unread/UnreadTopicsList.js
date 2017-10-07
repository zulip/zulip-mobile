/* @flow */
import React, { PureComponent } from 'react';
import { View, StyleSheet } from 'react-native';

import type { User, Stream } from '../types';
import { Label } from '../common';

const componentStyles = StyleSheet.create({
  emptyUnread: {
    fontSize: 16,
  },
});

export default class UnreadTopicsListCard extends PureComponent {
  props: {
    senders: User[],
    stream: Stream,
    topic: string,
    unreadCount: number,
  };

  static contextTypes = {
    styles: () => null,
  };

  render() {
    const { styles } = this.context;
    const { senders, stream, topic, unreadCount } = this.props;

    // sender_ids: [7, 907],
    // stream_id: 6,
    // topic: '500 server error page',
    // unread_message_ids: (4)[(293245, 293283, 293284, 293311)],

    return (
      <View style={styles.list}>
        <View>Stream \ Topic Header</View>
        <View>Message rendered</View>
        <View>+ (unreadCount - 1) unread messages</View>
        <View>List of avatars</View>
      </View>
    );
  }
}
