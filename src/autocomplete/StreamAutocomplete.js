/* @flow strict-local */

import React, { useCallback } from 'react';
import type { Node } from 'react';
import { FlatList } from 'react-native';

import { useSelector } from '../react-redux';
import { Popup } from '../common';
import { getSubscribedStreams } from '../subscriptions/subscriptionSelectors';
import StreamItem from '../streams/StreamItem';

type Props = $ReadOnly<{|
  filter: string,
  onAutocomplete: (name: string) => void,
|}>;

export default function StreamAutocomplete(props: Props): Node {
  const { filter, onAutocomplete } = props;
  const subscriptions = useSelector(getSubscribedStreams);

  const handleStreamItemAutocomplete = useCallback(
    (name: string): void => {
      onAutocomplete(`**${name}**`);
    },
    [onAutocomplete],
  );

  const matchingSubscriptions = subscriptions.filter(x =>
    x.name.toLowerCase().startsWith(filter.toLowerCase()),
  );

  if (matchingSubscriptions.length === 0) {
    return null;
  }

  return (
    <Popup>
      <FlatList
        nestedScrollEnabled
        keyboardShouldPersistTaps="always"
        initialNumToRender={matchingSubscriptions.length}
        data={matchingSubscriptions}
        keyExtractor={item => item.stream_id.toString()}
        renderItem={({ item }) => (
          <StreamItem
            name={item.name}
            isMuted={!item.in_home_view}
            isPrivate={item.invite_only}
            iconSize={12}
            color={item.color}
            onPress={handleStreamItemAutocomplete}
          />
        )}
      />
    </Popup>
  );
}
