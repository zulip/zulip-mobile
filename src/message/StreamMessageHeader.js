import React from 'react';
import {
  StyleSheet,
  View,
  Text,
} from 'react-native';

import {
  streamNarrow,
  topicNarrow,
} from '../lib/narrow';

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    backgroundColor: '#ddd',
  },
  stream: {
    backgroundColor: '#cec',
    padding: 4,
    fontSize: 16,
  },
  topic: {
    flex: 1,
    padding: 4,
    fontSize: 16,
  },
  private: {
    flex: 1,
    backgroundColor: '#333',
    color: '#fff',
  },
});

export default class StreamMessageHeader extends React.PureComponent {

  performStreamNarrow = () => {
    const { narrow, item, stream } = this.props;
    narrow(
      streamNarrow(stream),
      item.id,
      [item]
    );
  }

  performTopicNarrow = () => {
    const { narrow, item, stream, topic } = this.props;
    narrow(
      topicNarrow(stream, topic),
      item.id,
      [item]
    );
  }

  render() {
    const { stream, topic, color } = this.props;

    return (
      <View style={styles.header}>
        <Text
          style={[styles.stream, { backgroundColor: color }]}
          onPress={this.performStreamNarrow}
        >
          {stream}
        </Text>
        <Text
          style={styles.topic}
          numberOfLines={1}
          onPress={this.performTopicNarrow}
        >
          {topic}
        </Text>
      </View>
    );
  }
}
