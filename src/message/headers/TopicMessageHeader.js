import React from 'react';
import {
  StyleSheet,
  Text,
} from 'react-native';

import { Touchable } from '../../common';
import { topicNarrow } from '../../utils/narrow';

const styles = StyleSheet.create({
  header: {
    flex: 1,
  },
  topic: {
    flex: 1,
    padding: 4,
    fontSize: 16,
    backgroundColor: '#eee',
  },
});

export default class TopicMessageHeader extends React.PureComponent {

  performTopicNarrow = () => {
    const { narrow, item, stream, topic } = this.props;
    narrow(
      topicNarrow(stream, topic),
      item.id,
      [item]
    );
  }

  render() {
    const { topic } = this.props;

    return (
      <Touchable style={styles.header} onPress={this.performTopicNarrow}>
        <Text style={styles.topic} numberOfLines={1}>
          {topic}
        </Text>
      </Touchable>
    );
  }
}
