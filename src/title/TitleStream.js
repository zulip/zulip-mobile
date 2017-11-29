/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { Narrow, Stream } from '../types';
import StreamIcon from '../streams/StreamIcon';
import { isTopicNarrow } from '../utils/narrow';

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    flex: 1,
  },
  stream: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  streamText: {
    marginLeft: 4,
    fontSize: 18,
    // fontWeight: 'bold',
  },
  topic: {
    fontSize: 13,
    opacity: 0.8,
  },
});

type Props = {
  narrow: Narrow,
  stream: Stream,
  color: string,
};

export default class TitleStream extends PureComponent<Props> {
  props: Props;

  render() {
    const { narrow, stream, color } = this.props;

    return (
      <View style={styles.wrapper}>
        <StreamIcon
          isMuted={!stream.in_home_view}
          isPrivate={stream.invite_only}
          color={color}
          size={20}
        />
        <View style={styles.stream}>
          <Text style={[styles.streamText, { color }]} numberOfLines={1} ellipsizeMode="tail">
            {stream.name}
          </Text>
          {isTopicNarrow(narrow) && (
            <Text style={[styles.topic, { color }]} numberOfLines={1} ellipsizeMode="tail">
              {narrow[1].operand}
            </Text>
          )}
        </View>
      </View>
    );
  }
}
