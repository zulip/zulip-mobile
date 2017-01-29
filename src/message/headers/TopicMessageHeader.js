import React from 'react';
import {
  StyleSheet,
  Text,
} from 'react-native';

import { Touchable } from '../../common';
import { topicNarrow } from '../../utils/narrow';

const styles = StyleSheet.create({
  touch: {
    flex: 1,
  },
  topic: {
    padding: 8,
    fontSize: 16,
    backgroundColor: '#eee',
  },
});

export default class TopicMessageHeader extends React.PureComponent {

  props: {
    itemId: number,
    stream: string,
    topic: string,
  }

  performTopicNarrow = () => {
    const { doNarrow, stream, topic } = this.props;

    doNarrow(topicNarrow(stream, topic));
  }

  render() {
    const { topic } = this.props;

    return (
      <Touchable style={styles.touch} onPress={this.performTopicNarrow}>
        <Text style={styles.topic} numberOfLines={1} ellipsizeMode="tail">
          {topic}
        </Text>
      </Touchable>
    );
  }
}
