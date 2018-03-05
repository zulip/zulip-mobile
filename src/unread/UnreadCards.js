/* @flow */
import React, { PureComponent } from 'react';
import { SectionList, StyleSheet } from 'react-native';

import type { Actions, UnreadStream } from '../types';
import { Label, SearchEmptyState } from '../common';
import ConversationList from '../conversations/ConversationList';
import StreamItem from '../streams/StreamItem';
import TopicItem from '../streams/TopicItem';
import { streamNarrow, topicNarrow } from '../utils/narrow';

const componentStyles = StyleSheet.create({
  label: {
    paddingTop: 8,
    paddingLeft: 4,
    paddingBottom: 4,
  },
});

type Props = {
  actions: Actions,
  conversations: Object[],
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
    const { conversations, unreadStreamsAndTopics, ...restProps } = this.props;
    const unreadCards = [];
    if (conversations.length > 0) {
      unreadCards.push({
        key: 'private',
        data: [{ conversations, ...restProps }],
        title: 'Private Messages',
        Component: ConversationList,
      });
    }
    unreadCards.push(...unreadStreamsAndTopics);

    if (unreadCards.length === 0) {
      return <SearchEmptyState text="No unread messages" />;
    }
    return (
      <SectionList
        stickySectionHeadersEnabled
        initialNumToRender={2}
        sections={unreadCards}
        renderSectionHeader={({ section }) =>
          section.Component ? (
            <Label style={[styles.backgroundColor, componentStyles.label]} text={section.title} />
          ) : section.isMuted ? null : (
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
        renderItem={({ item, section }) => {
          const { Component } = section;
          return Component ? (
            <Component {...item} />
          ) : section.isMuted || item.isMuted ? null : (
            <TopicItem
              name={item.topic}
              stream={section.streamName || ''}
              isMuted={section.isMuted || item.isMuted}
              isSelected={false}
              unreadCount={item.unread}
              onPress={this.handleTopicPress}
            />
          );
        }}
      />
    );
  }
}
