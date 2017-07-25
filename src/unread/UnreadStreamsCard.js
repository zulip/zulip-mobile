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

  handleStreamPress = (streamName: string) => {
    const { actions } = this.props;
    actions.doNarrow(streamNarrow(streamName));
  };

  handleTopicPress = (stream: string, topic: string) => {
    const { actions } = this.props;
    actions.doNarrow(topicNarrow(stream, topic));
  };

  render() {
    const { styles } = this.context;
    const { unreadStreamsAndTopics } = this.props;
    const sections = unreadStreamsAndTopics;

    return (
      <SectionList
        style={styles.list}
        initialNumToRender={20}
        sections={sections}
        renderSectionHeader={({ name, color, unread, section }) =>
          <StreamItem
            style={styles.groupHeader}
            name={section.streamName}
            iconSize={16}
            color={section.color}
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
