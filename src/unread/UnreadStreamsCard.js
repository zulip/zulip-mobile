/* @flow */
import React, { PureComponent } from 'react';
import { SectionList } from 'react-native';

import type { Actions, UnreadStream } from '../types';
import { SearchEmptyState } from '../common';
import { streamNarrow, topicNarrow } from '../utils/narrow';
import StreamItem from '../streams/StreamItem';
import TopicItem from '../streams/TopicItem';

type Props = {
  unreadStreamsAndTopics: UnreadStream[],
  actions: Actions,
  unreadStreamsAndTopics: any,
};

export default class UnreadStreamsCard extends PureComponent<Props> {
  props: Props;

  static contextTypes = {
    styles: () => null,
  };

  handleStreamPress = (stream: string) => {
    this.props.actions.doNarrow(streamNarrow(stream));
  };

  handleTopicPress = (stream: string, topic: string) => {
    this.props.actions.doNarrow(topicNarrow(stream, topic));
  };

  render() {
    const { styles } = this.context;
    const { unreadStreamsAndTopics } = this.props;
    const noResults = unreadStreamsAndTopics.length === 0;

    if (noResults) {
      return <SearchEmptyState text="No unread messages" />;
    }

    return (
      <SectionList
        style={styles.list}
        stickySectionHeadersEnabled
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
          )
        }
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
          )
        }
      />
    );
  }
}
