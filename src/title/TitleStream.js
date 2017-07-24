/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { Narrow, Stream } from '../types';
import StreamIcon from '../streams/StreamIcon';
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

export default class TitleStream extends PureComponent {
  props: {
    narrow: Narrow,
    stream: Stream,
    color: string,
  };

  render() {
    const { narrow, stream, color } = this.props;
    const topic = isTopicNarrow(narrow) ? `\u203a ${narrow[1].operand}` : '';

    return (
      <View style={styles.wrapper}>
        <StreamIcon
          isMuted={!stream.in_home_view}
          isPrivate={stream.invite_only}
          color={color}
          size={12}
        />
        <Text style={[styles.text, { color }]} numberOfLines={1} ellipsizeMode="tail">
          {stream.name} {topic}
        </Text>
      </View>
    );
  }
}
