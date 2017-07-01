/* @flow */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import StreamIcon from '../streamlist/StreamIcon';
import { isTopicNarrow } from '../utils/narrow';

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  text: {
    marginLeft: 4,
    marginRight: 12,
    fontSize: 15,
  },
});

export default class TitleStream extends React.PureComponent {

  props: {
    subscriptions: [],
    narrow: () => {},
    color: string,
  };

  render() {
    const { narrow, subscriptions, color } = this.props;
    const stream = subscriptions.find(x => x.name === narrow[0].operand) || {
      name: '',
      invite_only: false,
      in_home_view: false
    };

    const topic = isTopicNarrow(narrow) ? `\u203a ${narrow[1].operand}` : '';

    return (
      <View style={styles.wrapper}>
        <StreamIcon
          isMuted={!stream.in_home_view}
          isPrivate={stream.invite_only}
          color={color}
          size={12}
        />
        <Text
          style={[styles.text, { color }]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {stream.name} {topic}
        </Text>
      </View>
    );
  }
}
