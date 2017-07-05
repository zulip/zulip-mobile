/* @flow */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { StyleObj } from '../../types';
import { Touchable } from '../../common';
import { topicNarrow } from '../../utils/narrow';

const componentStyles = StyleSheet.create({
  wrapper: {
    flex: 1,
    overflow: 'hidden',
  },
  touch: {
    justifyContent: 'center',
  },
  topic: {
    padding: 8,
    fontSize: 16,
    lineHeight: 16,
    backgroundColor: 'rgba(127, 127, 127, 0.25)',
  },
});

export default class TopicMessageHeader extends React.PureComponent {

  static contextTypes = {
    styles: () => null,
  };

  props: {
    style?: StyleObj,
    itemId: number,
    stream: string,
    topic: string,
    doNarrow: () => void,
  }

  performTopicNarrow = () => {
    const { itemId, doNarrow, stream, topic } = this.props;

    doNarrow(topicNarrow(stream, topic), itemId);
  }

  topicText() {
    const { topic, isTopicNarrow } = this.props;
    const { styles } = this.context;
    return isTopicNarrow ? (
      <Text
        style={[componentStyles.topic, styles.color]}
      >
        {topic}
      </Text>
    ) : (
      <Text
        style={[componentStyles.topic, styles.color]}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {topic}
      </Text>
    );
  }

  render() {
    const { styles } = this.context;
    const { style } = this.props;

    return (
      <View style={[componentStyles.wrapper, styles.background, style]}>
        <Touchable style={componentStyles.touch} onPress={this.performTopicNarrow}>
          {this.topicText()}
        </Touchable>
      </View>
    );
  }
}
