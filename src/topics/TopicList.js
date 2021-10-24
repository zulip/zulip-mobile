/* @flow strict-local */
import React, { PureComponent } from 'react';
import type { Node } from 'react';
import { FlatList } from 'react-native';

import type { Stream, TopicExtended } from '../types';
import { createStyleSheet } from '../styles';
import TopicItem from '../streams/TopicItem';
import { LoadingIndicator, SearchEmptyState } from '../common';

const styles = createStyleSheet({
  list: {
    flex: 1,
    flexDirection: 'column',
  },
});

type Props = $ReadOnly<{|
  stream: Stream,
  topics: ?(TopicExtended[]),
  onPress: (streamId: number, streamName: string, topic: string) => void,
|}>;

export default class TopicList extends PureComponent<Props> {
  render(): Node {
    const { stream, topics, onPress } = this.props;

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
            streamName={stream.name}
            name={item.name}
            isMuted={item.isMuted}
            unreadCount={item.unreadCount}
            onPress={onPress}
          />
        )}
      />
    );
  }
}
