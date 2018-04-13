/* @flow */
import React, { PureComponent } from 'react';
import { SectionList, View, StyleSheet, SwipeableFlatList } from 'react-native';

import { streamNarrow, topicNarrow } from '../utils/narrow';
import StreamItem from '../streams/StreamItem';
import TopicItem from '../streams/TopicItem';
import UnreadStreamCard from './UnreadStreamCard';
import MarkAsReadQuickAction from './MarkAsReadQuickAction';

const componentStyles = StyleSheet.create({
  emptyUnreadContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyUnread: {
    fontSize: 16,
  },
  list: {
    backgroundColor: 'red',
  },
});

export default class UnreadListRoot extends PureComponent {
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

    console.log('YOLO MA MAN', unreadStreamsAndTopics);

    return (
      <SwipeableFlatList
        data={unreadStreamsAndTopics}
        bounceFirstRowOnMount
        maxSwipeDistance={160}
        renderItem={({ item }) => (
          <UnreadStreamCard
            style={styles.groupHeader}
            name={item.streamName}
            topic={item.topic}
            iconSize={16}
            isMuted={item.isMuted}
            isPrivate={item.isPrivate}
            color={item.color}
            backgroundColor={item.color}
            unreadCount={item.unread}
            onPress={this.handleStreamPress}
          />
        )}
        renderQuickActions={() => <MarkAsReadQuickAction />}
      />
    );
  }
}
