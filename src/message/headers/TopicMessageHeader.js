import React from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Touchable } from '../../common';
import { topicNarrow } from '../../utils/narrow';

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  touch: {
    justifyContent: 'center',
  },
  topic: {
    padding: 8,
    fontSize: 16,
    lineHeight: 16,
    backgroundColor: '#ddd',
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
    const { topic, customStyle } = this.props;

    return (
      <View style={[styles.wrapper, customStyle]}>
        <Touchable style={styles.touch} onPress={this.performTopicNarrow}>
          <Text style={styles.topic} numberOfLines={1} ellipsizeMode="tail">
            {topic}
          </Text>
        </Touchable>
      </View>
    );
  }
}
