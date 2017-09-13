/* @flow */
import React, { PureComponent } from 'react';
import { SectionList } from 'react-native';

import { streamNarrow, topicNarrow } from '../utils/narrow';
import StreamItem from '../streams/StreamItem';
import TopicItem from '../streams/TopicItem';

export default class UnreadStreamsCard extends PureComponent {
  static contextTypes = {
    styles: () => null,
  };

  handleStreamPress = (stream: string) => {
    this.props.doNarrowCloseDrawer(streamNarrow(stream));
  };

  handleTopicPress = (stream: string, topic: string) => {
    this.props.doNarrowCloseDrawer(topicNarrow(stream, topic));
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
          section.isMuted ? null : (
            <StreamItem
              style={styles.groupHeader}
              name={section.streamName}
              iconSize={16}
              isMuted={section.isMuted}
              isPrivate={section.isPrivate}
              color={section.color}
              backgroundColor={section.color}
              unreadCount={section.unread}
              onPress={this.handleStreamPress}
            />
          )}
        renderItem={({ item, section }) =>
          section.isMuted || item.isMuted ? null : (
            <TopicItem
              name={item.topic}
              stream={section.streamName}
              isMuted={section.isMuted || item.isMuted}
              isSelected={false}
              unreadCount={item.unread}
              onPress={this.handleTopicPress}
            />
          )}
      />
    );
  }
}
