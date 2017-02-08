import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Touchable } from '../../common';
import TopicMessageHeader from './TopicMessageHeader';
import { streamNarrow } from '../../utils/narrow';
import { foregroundColorFromBackground } from '../../utils/color';
import StreamIcon from '../../streamlist/StreamIcon';

const styles = StyleSheet.create({
  header: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: '#eee',
    overflow: 'hidden',
  },
  stream: {
    padding: 8,
    fontSize: 16,
    lineHeight: 16,
  },
  icon: {
    paddingLeft: 8,
  },
  triangle: {
    borderTopWidth: 18,
    borderRightWidth: 0,
    borderBottomWidth: 18,
    borderLeftWidth: 18,
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
  }
});

export default class StreamMessageHeader extends React.PureComponent {

  props: {
    itemId: number,
    stream: string,
    color: string,
    isPrivate: boolean,
  }

  performStreamNarrow = () => {
    const { doNarrow, stream } = this.props;
    doNarrow(streamNarrow(stream));
  }

  render() {
    const { stream, isPrivate, isMuted, topic, color, itemId, doNarrow } = this.props;
    const textColor = foregroundColorFromBackground(color);
    const iconType = isPrivate ? 'lock' : 'hashtag';

    return (
      <View style={styles.header}>
        <Touchable onPress={this.performStreamNarrow}>
          <View style={[styles.header, { backgroundColor: color }]}>
            <StreamIcon
              name={iconType}
              color={textColor}
              isPrivate={isPrivate}
              isMuted={isMuted}
              size={16}
              style={styles.icon}
            />
            <Text style={[styles.stream, { color: textColor }]}>
              {stream}
            </Text>
          </View>
        </Touchable>
        <View style={[styles.triangle, { borderLeftColor: color }]} />
        <TopicMessageHeader
          itemId={itemId}
          stream={stream}
          topic={topic}
          doNarrow={doNarrow}
        />
      </View>
    );
  }
}
