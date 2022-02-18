/* @flow strict-local */

import React, { useCallback } from 'react';
import type { Node } from 'react';
import { View, SectionList } from 'react-native';

import type { RouteProp } from '../react-navigation';
import type { StreamTabsNavigationProp } from '../main/StreamTabsScreen';
import type { Subscription } from '../types';
import { createStyleSheet } from '../styles';
import { useDispatch, useSelector } from '../react-redux';
import { LoadingBanner, SectionSeparatorBetween, SearchEmptyState } from '../common';
import { streamNarrow } from '../utils/narrow';
import { getUnreadByStream } from '../selectors';
import { getSubscriptions } from '../directSelectors';
import { doNarrow } from '../actions';
import { caseInsensitiveCompareFunc } from '../utils/misc';
import StreamItem from './StreamItem';

const listStyles = createStyleSheet({
  list: {
    flex: 1,
    flexDirection: 'column',
  },
});

type SubscriptionListProps = $ReadOnly<{|
  subscriptions: $ReadOnlyArray<Subscription>,
  unreadByStream: $ReadOnly<{| [number]: number |}>,
  onPress: (streamId: number, streamName: string) => void,
|}>;

// TODO(#3767): Simplify this by specializing to its one caller.
function SubscriptionList(props: SubscriptionListProps): Node {
  const { subscriptions, unreadByStream, onPress } = props;

  if (subscriptions.length === 0) {
    return <SearchEmptyState text="No streams found" />;
  }

  const sortedSubscriptions = subscriptions
    .slice()
    .sort((a, b) => caseInsensitiveCompareFunc(a.name, b.name));
  const sections = [
    {
      key: 'Pinned',
      data: sortedSubscriptions.filter(x => x.pin_to_top),
    },
    {
      key: 'Unpinned',
      data: sortedSubscriptions.filter(x => !x.pin_to_top),
    },
  ];

  return (
    <SectionList
      style={listStyles.list}
      sections={sections}
      extraData={unreadByStream}
      initialNumToRender={20}
      keyExtractor={item => item.stream_id}
      renderItem={({ item }: { item: Subscription, ... }) => (
        <StreamItem
          streamId={item.stream_id}
          name={item.name}
          iconSize={16}
          isPrivate={item.invite_only}
          isWebPublic={item.is_web_public}
          description=""
          color={item.color}
          unreadCount={unreadByStream[item.stream_id]}
          isMuted={item.in_home_view === false} // if 'undefined' is not muted
          showSwitch={false}
          // isSubscribed is ignored when showSwitch false
          onPress={onPress}
        />
      )}
      SectionSeparatorComponent={SectionSeparatorBetween}
    />
  );
}

const styles = createStyleSheet({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
});

type Props = $ReadOnly<{|
  navigation: StreamTabsNavigationProp<'subscribed'>,
  route: RouteProp<'subscribed', void>,
|}>;

export default function SubscriptionsCard(props: Props): Node {
  const dispatch = useDispatch();
  const subscriptions = useSelector(getSubscriptions);
  const unreadByStream = useSelector(getUnreadByStream);

  const handleNarrow = useCallback(
    (streamId: number) => dispatch(doNarrow(streamNarrow(streamId))),
    [dispatch],
  );

  return (
    <View style={styles.container}>
      <LoadingBanner />
      <SubscriptionList
        subscriptions={subscriptions}
        unreadByStream={unreadByStream}
        onPress={handleNarrow}
      />
    </View>
  );
}
