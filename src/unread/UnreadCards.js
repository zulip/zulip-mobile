/* @flow */
import { connect } from 'react-redux';

import React, { PureComponent } from 'react';
import { SectionList } from 'react-native';

import type { Context, Dispatch, PmConversationData, PresenceState, UnreadStream } from '../types';
import { LoadingIndicator, SearchEmptyState } from '../common';
import PmConversationList from '../conversations/PmConversationList';
import StreamItem from '../streams/StreamItem';
import TopicItem from '../streams/TopicItem';
import { streamNarrow, topicNarrow } from '../utils/narrow';
import {
  getLoading,
  getPresence,
  getUnreadConversations,
  getAllUsersAndBotsByEmail,
  getUnreadStreamsAndTopicsSansMuted,
} from '../selectors';
import { doNarrow } from '../actions';

type Props = {
  conversations: PmConversationData[],
  dispatch: Dispatch,
  isLoading: boolean,
  presences: PresenceState,
  usersByEmail: Object,
  unreadStreamsAndTopics: UnreadStream[],
  unreadStreamsAndTopics: any,
};

class UnreadCards extends PureComponent<Props> {
  context: Context;
  props: Props;

  static contextTypes = {
    styles: () => null,
  };

  handleStreamPress = (stream: string) => {
    this.props.dispatch(doNarrow(streamNarrow(stream)));
  };

  handleTopicPress = (stream: string, topic: string) => {
    this.props.dispatch(doNarrow(topicNarrow(stream, topic)));
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

    if (unreadStreamsAndTopics.length === 0) {
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
          section.key === 'private' ? null : (
            <StreamItem
              style={styles.listItem}
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

export default connect(state => ({
  isLoading: getLoading(state).unread,
  conversations: getUnreadConversations(state),
  presences: getPresence(state),
  usersByEmail: getAllUsersAndBotsByEmail(state),
  unreadStreamsAndTopics: getUnreadStreamsAndTopicsSansMuted(state),
}))(UnreadCards);
