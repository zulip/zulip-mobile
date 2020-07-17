/* @flow strict-local */

import React, { PureComponent } from 'react';
import { SectionList } from 'react-native';
import { Set } from 'immutable';

import type { Dispatch, PmConversationData, UnreadStreamItem, UserOrBot } from '../types';
import { connect } from '../react-redux';
import { SearchEmptyState } from '../common';
import PmConversationList from '../pm-conversations/PmConversationList';
import StreamItem from '../streams/StreamItem';
import TopicItem from '../streams/TopicItem';
import { streamNarrow, topicNarrow } from '../utils/narrow';
import {
  getUnreadConversations,
  getAllUsersByEmail,
  getUnreadStreamsAndTopicsSansMuted,
} from '../selectors';
import { doNarrow } from '../actions';

type Props = $ReadOnly<{|
  conversations: PmConversationData[],
  dispatch: Dispatch,
  usersByEmail: Map<string, UserOrBot>,
  unreadStreamsAndTopics: UnreadStreamItem[],
  bulkSelection: Set<string> | null,
  handleTopicSelect: (stream: string, topic: string) => void,
|}>;

class UnreadCards extends PureComponent<Props> {
  handleStreamPress = (stream: string) => {
    setTimeout(() => this.props.dispatch(doNarrow(streamNarrow(stream))));
  };

  handleTopicPress = (stream: string, topic: string) => {
    const { bulkSelection, handleTopicSelect } = this.props;
    if (bulkSelection === null) {
      setTimeout(() => this.props.dispatch(doNarrow(topicNarrow(stream, topic))));
    } else {
      handleTopicSelect(stream, topic);
    }
  };

  handleTopicLongPress = (stream: string, topic: string) => {
    const { handleTopicSelect } = this.props;
    handleTopicSelect(stream, topic);
  };

  getBulkSelectionStatus = (stream: string, topic: string): boolean => {
    const { bulkSelection } = this.props;
    if (bulkSelection === null) {
      return false;
    }
    const narrow = JSON.stringify(topicNarrow(stream, topic));
    return bulkSelection.includes(narrow);
  };

  render() {
    const {
      conversations,
      unreadStreamsAndTopics,
      bulkSelection,
      // eslint-disable-next-line no-unused-vars
      handleTopicSelect,
      ...restProps
    } = this.props;
    type Card =
      | UnreadStreamItem
      | { key: 'private', data: Array<$PropertyType<PmConversationList, 'props'>> };
    const unreadCards: Array<Card> = [
      {
        key: 'private',
        data: [{ conversations, ...restProps }],
      },
      ...unreadStreamsAndTopics,
    ];

    if (unreadStreamsAndTopics.length === 0 && conversations.length === 0) {
      return <SearchEmptyState text="No unread messages" />;
    }

    return (
      // $FlowFixMe SectionList libdef seems confused; should take $ReadOnly objects.
      <SectionList
        stickySectionHeadersEnabled
        initialNumToRender={20}
        sections={unreadCards}
        keyExtractor={item => item.key}
        renderSectionHeader={({ section }) =>
          section.key === 'private' ? null : (
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
          ) : (
            <TopicItem
              name={item.topic}
              stream={section.streamName || ''}
              isMuted={section.isMuted || item.isMuted}
              isSelected={false}
              inBulkSelectionMode={bulkSelection !== null}
              isBulkSelected={this.getBulkSelectionStatus(section.streamName, item.topic)}
              unreadCount={item.unread}
              onPress={this.handleTopicPress}
              onLongPress={this.handleTopicLongPress}
            />
          )
        }
      />
    );
  }
}

export default connect(state => ({
  conversations: getUnreadConversations(state),
  usersByEmail: getAllUsersByEmail(state),
  unreadStreamsAndTopics: getUnreadStreamsAndTopicsSansMuted(state),
}))(UnreadCards);
