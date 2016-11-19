import React from 'react';
import {
  StyleSheet,
  View,
  Text,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import { streamNarrow, topicNarrow } from '../../utils/narrow';
import { foregroundColorFromBackground } from '../../utils/color';

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    backgroundColor: '#ddd',
  },
  stream: {
    padding: 4,
    fontSize: 16,
  },
  topic: {
    flex: 1,
    padding: 4,
    fontSize: 16,
  },
  icon: {
    padding: 6,
  }
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
    const { stream, isPrivate, topic, color } = this.props;
    const textColor = foregroundColorFromBackground(color);
    const colors = {
      color: textColor,
      backgroundColor: color,
    };
    const iconType = isPrivate ? 'md-lock' : 'md-chatbubbles';

    return (
      <View style={styles.header}>
        <Icon
          name={iconType}
          color={textColor}
          size={16}
          style={[styles.icon, colors]}
        />
        <Text
          style={[styles.stream, colors]}
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
