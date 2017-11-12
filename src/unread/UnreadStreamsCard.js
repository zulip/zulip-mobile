/* @flow */
import React, { PureComponent } from 'react';
import { SectionList, View, StyleSheet } from 'react-native';

import type { Narrow, UnreadStream } from '../types';
import { Label } from '../common';
import { streamNarrow, topicNarrow } from '../utils/narrow';
import StreamItem from '../streams/StreamItem';
import TopicItem from '../streams/TopicItem';

const componentStyles = StyleSheet.create({
  emptyUnreadContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyUnread: {
    fontSize: 16,
  },
});

type Props = {
  unreadStreamsAndTopics: UnreadStream[],
  doNarrowCloseDrawer: (narrow: Narrow) => void,
};

export default class UnreadStreamsCard extends PureComponent<Props> {
  props: Props;

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

    if (unreadStreamsAndTopics.length === 0) {
      return (
        <View style={componentStyles.emptyUnreadContainer}>
          <Label style={componentStyles.emptyUnread} text="No unread messages" />
        </View>
      );
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
