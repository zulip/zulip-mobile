/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { Actions } from '../../types';
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

type Props = {
  actions: Actions,
  messageId: number,
  stream: string,
  topic: string,
  onLongPress: () => void,
};

export default class TopicMessageHeader extends PureComponent<Props> {
  static contextTypes = {
    styles: () => null,
  };

  props: Props;

  performTopicNarrow = () => {
    const { actions, messageId, stream, topic } = this.props;

    actions.doNarrow(topicNarrow(stream, topic), messageId);
  };

  render() {
    const { styles } = this.context;
    const { topic, onLongPress } = this.props;

    return (
      <View style={[componentStyles.wrapper, styles.background]}>
        <Touchable
          style={componentStyles.touch}
          onPress={this.performTopicNarrow}
          onLongPress={onLongPress}
        >
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
