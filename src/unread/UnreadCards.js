/* @flow */
import { connect } from 'react-redux';

import React, { PureComponent } from 'react';
import { SectionList } from 'react-native';

import type { Dispatch, GlobalState, PmConversationData, PresenceState } from '../types';
import { LoadingIndicator, SearchEmptyState, SectionSeparator } from '../common';
import PmConversationList from '../pm-conversations/PmConversationList';
import StreamItem from '../streams/StreamItem';
import TopicItem from '../streams/TopicItem';
import { streamNarrow, topicNarrow } from '../utils/narrow';
import {
  getLoading,
  getPresence,
  getUnreadConversations,
  getAllUsersByEmail,
  getUnreadStreamsAndTopicsSansMuted,
} from '../selectors';
import { doNarrow } from '../actions';

type Props = {|
  conversations: PmConversationData[],
  dispatch: Dispatch,
  isLoading: boolean,
  presences: PresenceState,
  usersByEmail: Object,
  unreadStreamsAndTopics: any /* UnreadStream[] */,
|};

class UnreadCards extends PureComponent<Props> {
  handleStreamPress = (stream: string) => {
    setTimeout(() => this.props.dispatch(doNarrow(streamNarrow(stream))));
  };

  handleTopicPress = (stream: string, topic: string) => {
    setTimeout(() => this.props.dispatch(doNarrow(topicNarrow(stream, topic))));
  };

  render() {
    const { isLoading, conversations, unreadStreamsAndTopics, ...restProps } = this.props;
    const unreadCards = [
      {
        key: 'private',
        data: [{ conversations, ...restProps }],
      },
      ...unreadStreamsAndTopics.filter(item => item.isPinned),
      {
        key: 'separator',
        data: [{}],
      },
      ...unreadStreamsAndTopics.filter(item => !item.isPinned),
    ];

    if (unreadStreamsAndTopics.length === 0 && conversations.length === 0) {
      return isLoading ? (
        <LoadingIndicator size={40} />
      ) : (
        <SearchEmptyState text="No unread messages" />
      );
    }

    return (
      <SectionList
        stickySectionHeadersEnabled
        initialNumToRender={20}
        sections={unreadCards}
        keyExtractor={item => item.key}
        renderSectionHeader={({ section }) =>
          section.key === 'private' || section.key === 'separator' ? null : (
            <StreamItem
              name={section.streamName}
              iconSize={16}
              isMuted={section.isMuted}
              isPrivate={section.isPrivate}
              backgroundColor={section.color}
              unreadCount={section.unread}
              onPress={this.handleStreamPress}
            />
          )
        }
        renderItem={({ item, section }) =>
          section.key === 'private' ? (
            <PmConversationList {...item} />
          ) : section.key === 'separator' ? (
            <SectionSeparator />
          ) : (
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

export default connect((state: GlobalState) => ({
  isLoading: getLoading(state).unread,
  conversations: getUnreadConversations(state),
  presences: getPresence(state),
  usersByEmail: getAllUsersByEmail(state),
  unreadStreamsAndTopics: getUnreadStreamsAndTopicsSansMuted(state),
}))(UnreadCards);
