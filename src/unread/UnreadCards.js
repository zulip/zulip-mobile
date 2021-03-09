/* @flow strict-local */

import React from 'react';
import { SectionList } from 'react-native';

import type { UnreadStreamItem } from '../types';
import { useDispatch, useSelector } from '../react-redux';
import { SearchEmptyState } from '../common';
import PmConversationList from '../pm-conversations/PmConversationList';
import StreamItem from '../streams/StreamItem';
import TopicItem from '../streams/TopicItem';
import { streamNarrow, topicNarrow } from '../utils/narrow';
import { getUnreadConversations, getUnreadStreamsAndTopicsSansMuted } from '../selectors';
import { doNarrow } from '../actions';

type Props = $ReadOnly<{||}>;

export default function UnreadCards(props: Props) {
  const dispatch = useDispatch();
  const conversations = useSelector(getUnreadConversations);
  const unreadStreamsAndTopics = useSelector(getUnreadStreamsAndTopicsSansMuted);
  type Card =
    | UnreadStreamItem
    | {| key: 'private', data: Array<React$ElementConfig<typeof PmConversationList>> |};
  const unreadCards: Array<Card> = [
    {
      key: 'private',
      data: [{ conversations, dispatch }],
    },
    ...unreadStreamsAndTopics,
  ];

  if (unreadStreamsAndTopics.length === 0 && conversations.length === 0) {
    return <SearchEmptyState text="No unread messages" />;
  }

  return (
    // $FlowFixMe[incompatible-type-arg]
    /* $FlowFixMe[prop-missing]
       SectionList libdef seems confused; should take $ReadOnly objects. */
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
            onPress={(stream: string) => {
              setTimeout(() => dispatch(doNarrow(streamNarrow(stream))));
            }}
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
            onPress={(stream: string, topic: string) => {
              setTimeout(() => dispatch(doNarrow(topicNarrow(stream, topic))));
            }}
          />
        )
      }
    />
  );
}
