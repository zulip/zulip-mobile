/* @flow */
import React, { PureComponent } from 'react';
import { SectionList } from 'react-native';

import { streamNarrow, topicNarrow } from '../utils/narrow';
import StreamItem from '../streams/StreamItem';
import TopicItem from '../streams/TopicItem';

export default class UnreadStreamsContainer extends PureComponent {
  static contextTypes = {
    styles: () => null,
  };

  handleStreamPress = (stream: string) => {
    const { actions, onNarrow } = this.props;
    actions.doNarrow(streamNarrow(stream));
    onNarrow();
  };

  handleTopicPress = (stream: string, topic: string) => {
    const { actions, onNarrow } = this.props;
    actions.doNarrow(topicNarrow(stream, topic));
    onNarrow();
  };

  render() {
    const { styles } = this.context;
    const { unreadStreamsAndTopics } = this.props;

    return (
      <SectionList
        style={styles.list}
        initialNumToRender={20}
        sections={unreadStreamsAndTopics}
        renderSectionHeader={({ section }) =>
          <StreamItem
            style={styles.groupHeader}
            name={section.streamName}
            iconSize={16}
            color={section.color}
            backgroundColor={section.color}
            unreadCount={section.unread}
            onPress={this.handleStreamPress}
          />}
        renderItem={({ item, section }) =>
          <TopicItem
            name={item.topic}
            stream={section.streamName}
            isMuted={false}
            isSelected={false}
            unreadCount={item.unread}
            onPress={this.handleTopicPress}
          />}
      />
    );
  }
}
