/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { Actions } from '../../types';
import { Touchable } from '../../common';
import TopicMessageHeader from './TopicMessageHeader';
import { streamNarrow } from '../../utils/narrow';
import { foregroundColorFromBackground } from '../../utils/color';
import StreamIcon from '../../streams/StreamIcon';

const componentStyles = StyleSheet.create({
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    overflow: 'hidden',
    height: 32,
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
    borderTopWidth: 16,
    borderRightWidth: 0,
    borderBottomWidth: 16,
    borderLeftWidth: 16,
    borderTopColor: 'rgba(127, 127, 127, 0.25)',
    borderRightColor: 'rgba(127, 127, 127, 0.25)',
    borderBottomColor: 'rgba(127, 127, 127, 0.25)',
  },
});

type Props = {
  actions: Actions,
  messageId: number,
  stream: string,
  topic: string,
  color: string,
  isMuted: boolean,
  isPrivate: boolean,
  onLongPress: () => void,
};

export default class StreamMessageHeader extends PureComponent<Props> {
  props: Props;

  static contextTypes = {
    styles: () => null,
  };

  performStreamNarrow = () => {
    const { actions, messageId, stream } = this.props;
    actions.doNarrow(streamNarrow(stream), messageId);
  };

  render() {
    const { styles } = this.context;
    const {
      actions,
      stream,
      isPrivate,
      isMuted,
      topic,
      color,
      messageId,
      onLongPress,
    } = this.props;
    const textColor = foregroundColorFromBackground(color);

    return (
      <View style={[componentStyles.header, styles.background]}>
        <Touchable onPress={this.performStreamNarrow} onLongPress={onLongPress}>
          <View style={[componentStyles.header, { backgroundColor: color }]}>
            <StreamIcon
              color={textColor}
              isPrivate={isPrivate}
              isMuted={isMuted}
              size={16}
              style={componentStyles.icon}
            />
            <Text style={[componentStyles.stream, { color: textColor }]}>{stream}</Text>
          </View>
        </Touchable>
        <View style={[componentStyles.triangle, { borderLeftColor: color }]} />
        <TopicMessageHeader
          messageId={messageId}
          stream={stream}
          topic={topic}
          actions={actions}
          onLongPress={onLongPress}
        />
      </View>
    );
  }
}
