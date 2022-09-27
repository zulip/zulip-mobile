/* @flow strict-local */
import React from 'react';
import type { Node } from 'react';
import { FlatList } from 'react-native';

import type { Stream, TopicExtended } from '../types';
import { createStyleSheet } from '../styles';
import TopicItem from '../streams/TopicItem';
import LoadingIndicator from '../common/LoadingIndicator';
import SearchEmptyState from '../common/SearchEmptyState';

const styles = createStyleSheet({
  list: {
    flex: 1,
    flexDirection: 'column',
  },
});

type Props = $ReadOnly<{|
  stream: Stream,
  topics: ?$ReadOnlyArray<TopicExtended>,
  onPress: (streamId: number, topic: string) => void,
|}>;

export default function TopicList(props: Props): Node {
  const { stream, topics, onPress } = props;

  if (!topics) {
    return <LoadingIndicator size={40} />;
  }

  if (topics.length === 0) {
    return <SearchEmptyState text="No topics found" />;
  }

  return (
    <FlatList
      keyboardShouldPersistTaps="always"
      style={styles.list}
      data={topics}
      keyExtractor={item => item.name}
      renderItem={({ item }) => (
        <TopicItem
          streamId={stream.stream_id}
          name={item.name}
          isMuted={item.isMuted}
          unreadCount={item.unreadCount}
          onPress={onPress}
        />
      )}
    />
  );
}
