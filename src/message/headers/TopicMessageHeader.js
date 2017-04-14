import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import styles from '../../styles';
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

  props: {
    itemId: number,
    stream: string,
    topic: string,
  }

  performTopicNarrow = () => {
    const { itemId, doNarrow, stream, topic } = this.props;

    doNarrow(topicNarrow(stream, topic), itemId);
  }

  render() {
    const { topic, style } = this.props;

    return (
      <View style={[componentStyles.wrapper, styles.background, style]}>
        <Touchable style={componentStyles.touch} onPress={this.performTopicNarrow}>
          <Text
            style={[componentStyles.topic, styles.color]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {topic}
          </Text>
        </Touchable>
      </View>
    );
  }
}
