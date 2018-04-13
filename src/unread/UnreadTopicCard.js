/* @flow */
import React, { PureComponent } from 'react';
import { View, StyleSheet, Text } from 'react-native';

import type { User, Stream } from '../types';
import { Label, RawLabel } from '../common';

const componentStyles = StyleSheet.create({
  wrapper: {},
  emptyUnread: {
    fontSize: 16,
  },
});

export default class UnreadTopicCard extends PureComponent {
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
    const { senders, name, topic, unreadCount } = this.props;

    return (
      <View style={componentStyles.wrapper}>
        <Label text={name} />
        <Label text={topic} />
        <Text>Message rendered</Text>
        <RawLabel text={unreadCount} />
        <Label text="unread messages" />
        <Text>List of avatars here</Text>
      </View>
    );
  }
}
