/* @flow strict-local */

import React, { useState, useCallback, useEffect } from 'react';
import type { Node } from 'react';

import type { RouteProp } from '../react-navigation';
import type { AppNavigationProp } from '../nav/AppNavigator';
import { useSelector, useDispatch } from '../react-redux';
import { Screen } from '../common';
import { topicNarrow } from '../utils/narrow';
import { getTopicsForStream } from '../selectors';
import { getStreamForId } from '../subscriptions/subscriptionSelectors';
import TopicList from './TopicList';
import { fetchTopics, doNarrow } from '../actions';

type Props = $ReadOnly<{|
  navigation: AppNavigationProp<'topic-list'>,
  route: RouteProp<'topic-list', {| streamId: number |}>,
|}>;

export default function TopicListScreen(props: Props): Node {
  const dispatch = useDispatch();
  const stream = useSelector(state => getStreamForId(state, props.route.params.streamId));
  const topics = useSelector(state => getTopicsForStream(state, props.route.params.streamId));

  const [filter, setFilter] = useState<string>('');

  const handlePress = useCallback(
    (streamName: string, topic: string) => {
      dispatch(doNarrow(topicNarrow(streamName, topic)));
    },
    [dispatch],
  );

  useEffect(() => {
    dispatch(fetchTopics(stream.stream_id));
  }, [stream, dispatch]);

  const filteredTopics =
    topics && topics.filter(topic => topic.name.toLowerCase().includes(filter.toLowerCase()));

  return (
    <Screen
      title="Topics"
      centerContent
      search
      searchPlaceholder="Search topics"
      searchBarOnChange={setFilter}
      scrollEnabled={false}
    >
      <TopicList stream={stream} topics={filteredTopics} onPress={handlePress} />
    </Screen>
  );
}
