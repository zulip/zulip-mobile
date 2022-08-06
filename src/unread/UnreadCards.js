/* @flow strict-local */

import React, { useState } from 'react';
import type { Node } from 'react';
import { SectionList } from 'react-native';

import Immutable from 'immutable';
import { useDispatch, useSelector } from '../react-redux';
import SearchEmptyState from '../common/SearchEmptyState';
import PmConversationList from '../pm-conversations/PmConversationList';
import StreamItem from '../streams/StreamItem';
import TopicItem from '../streams/TopicItem';
import { streamNarrow, topicNarrow } from '../utils/narrow';
import { getUnreadConversations, getUnreadStreamsAndTopicsSansMuted } from '../selectors';
import { doNarrow } from '../actions';

/**
 * An item in the data prepared for this UI by its helper selectors.
 *
 * See `getUnreadStreamsAndTopicsSansMuted`, and its helper
 * `getUnreadStreamsAndTopics`.
 *
 * The exact collection of data included here is just an assortment of what
 * the UI in this file happens to need.
 */
export type UnreadStreamItem = {|
  key: string,
  streamId: number,
  streamName: string,
  unread: number,
  color: string,
  isMuted: boolean,
  isPinned: boolean,
  isPrivate: boolean,
  isWebPublic: boolean | void,
  data: $ReadOnlyArray<{|
    key: string,
    topic: string,
    isMentioned: boolean,
    unread: number,
    isMuted: boolean,
    lastUnreadMsgId: number,
  |}>,
|};

type Props = $ReadOnly<{||}>;

export default function UnreadCards(props: Props): Node {
  const dispatch = useDispatch();
  const conversations = useSelector(getUnreadConversations);
  const unreadStreamsAndTopics = useSelector(getUnreadStreamsAndTopicsSansMuted);
  type Card =
    | UnreadStreamItem
    | {| key: 'private', data: $ReadOnlyArray<React$ElementConfig<typeof PmConversationList>> |};
  const unreadCards: $ReadOnlyArray<Card> = [
    {
      key: 'private',
      data: [{ conversations }],
    },
    ...unreadStreamsAndTopics,
  ];

  const [collapsedStreamIds, setCollapsedStreamIds] = useState(Immutable.Set<number>());

  const handleExpandCollapse = (id: number) => {
    setCollapsedStreamIds(
      collapsedStreamIds.has(id) ? collapsedStreamIds.delete(id) : collapsedStreamIds.add(id),
    );
  };

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
      renderSectionHeader={({ section }) =>
        section.key === 'private' ? null : (
          <StreamItem
            streamId={section.streamId}
            name={section.streamName}
            iconSize={16}
            isCollapsed={collapsedStreamIds.has(section.streamId)}
            handleExpandCollapse={handleExpandCollapse}
            isMuted={section.isMuted}
            isPrivate={section.isPrivate}
            isWebPublic={section.isWebPublic}
            backgroundColor={section.color}
            unreadCount={section.unread}
            onPress={stream => {
              setTimeout(() => dispatch(doNarrow(streamNarrow(stream.stream_id))));
            }}
          />
        )
      }
      renderItem={({ item, section }) =>
        section.key === 'private' ? (
          <PmConversationList {...item} />
        ) : collapsedStreamIds.has(section.streamId) ? null : (
          <TopicItem
            streamId={section.streamId}
            name={item.topic}
            isMuted={section.isMuted || item.isMuted}
            isSelected={false}
            unreadCount={item.unread}
            isMentioned={item.isMentioned}
            onPress={(streamId: number, topic: string) => {
              setTimeout(() => dispatch(doNarrow(topicNarrow(streamId, topic))));
            }}
          />
        )
      }
    />
  );
}
