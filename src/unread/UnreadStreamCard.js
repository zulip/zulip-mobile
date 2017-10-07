/* @flow */
import React, { PureComponent } from 'react';
import { View, StyleSheet, Text } from 'react-native';

import type { User, Stream } from '../types';
import { Label, RawLabel } from '../common';
import StreamMessageHeader from '../message/headers/StreamMessageHeader';
import AvatarList from '../group/AvatarList';

const componentStyles = StyleSheet.create({
  wrapper: {},
});

export default class UnreadStreamCard extends PureComponent {
  props: {
    senders: ?(User[]),
    stream: Stream,
    topic: string,
    unreadCount: number,
  };

  static contextTypes = {
    styles: () => null,
  };

  render() {
    const { styles } = this.context;
    const { color, senders, name, topic, unreadCount } = this.props;

    // const userIds = users.reduce();
    const users = []; // getUsersById(sender_ids);
    console.log('UnreadStreamCard', this.props);
    // sender_ids: [7, 907],
    // stream_id: 6,
    // unread_message_ids: (4)[(293245, 293283, 293284, 293311)],

    return (
      <View style={componentStyles.wrapper}>
        <StreamMessageHeader stream={name} topic={topic} color={color} />
        <Text>[Message rendered]</Text>
        <RawLabel text={unreadCount} />
        <Label text="unread messages" />
        <Text>List of avatars here</Text>
        {senders && <AvatarList users={users} />}
      </View>
    );
  }
}
