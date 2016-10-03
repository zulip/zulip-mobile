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

const DEFAULT_PADDING = 8;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    overflow: 'hidden',
    backgroundColor: '#ddd',
  },
  stream: {
    backgroundColor: '#cec',
    padding: DEFAULT_PADDING,
    fontSize: 16,
  },
  topic: {
    padding: DEFAULT_PADDING,
    fontSize: 16,
  },
  private: {
    flex: 1,
    backgroundColor: '#333',
    color: '#fff',
  },
});

export default class StreamMessageHeader extends React.PureComponent {

  render() {
    return (
      <View style={styles.header}>
        <Text
          style={[styles.stream, { backgroundColor: this.props.color }]}
          onPress={() => this.props.narrow(
            streamNarrow(this.props.stream),
            this.props.item.id,
            [this.props.item]
          )}
        >
          {this.props.stream}
        </Text>
        <Text
          style={styles.topic}
          onPress={() => this.props.narrow(
            topicNarrow(this.props.stream, this.props.topic),
            this.props.item.id,
            [this.props.item]
          )}
        >
          {this.props.topic}
        </Text>
      </View>
    );
  }
}
