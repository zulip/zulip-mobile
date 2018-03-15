/* @flow */
import React, { PureComponent } from 'react';
import { SectionList } from 'react-native';

import type { Actions, UnreadStream } from '../types';
import { LoadingIndicator, SearchEmptyState } from '../common';
import ConversationList from '../conversations/ConversationList';
import StreamItem from '../streams/StreamItem';
import TopicItem from '../streams/TopicItem';
import { streamNarrow, topicNarrow } from '../utils/narrow';

type Props = {
  actions: Actions,
  conversations: Object[],
  isLoading: boolean,
  presences: Object,
  usersByEmail: Object,
  unreadStreamsAndTopics: UnreadStream[],
  unreadStreamsAndTopics: any,
};

export default class UnreadCards extends PureComponent<Props> {
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
    const { isLoading, conversations, unreadStreamsAndTopics, ...restProps } = this.props;
    const unreadCards = [
      {
        key: 'private',
        data: [{ conversations, ...restProps }],
      },
      ...unreadStreamsAndTopics,
    ];

    if (conversations.length === 0 && unreadStreamsAndTopics.length === 0) {
      return isLoading ? (
        <LoadingIndicator size={40} />
      ) : (
        <SearchEmptyState text="No unread messages" />
      );
    }

    return (
      <SectionList
        stickySectionHeadersEnabled
        initialNumToRender={2}
        sections={unreadCards}
        renderSectionHeader={({ section }) =>
          section.key === 'private' || section.isMuted ? null : (
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
          section.key === 'private' ? (
            <ConversationList {...item} />
          ) : section.isMuted || item.isMuted ? null : (
            <TopicItem
              name={item.topic}
              stream={section.streamName || ''}
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
