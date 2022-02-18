/* @flow strict-local */

import React, { useCallback } from 'react';
import type { Node } from 'react';
import { View, SectionList } from 'react-native';

import type { RouteProp } from '../react-navigation';
import type { StreamTabsNavigationProp } from '../main/StreamTabsScreen';
import type { Stream, Subscription } from '../types';
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

// TODO(#3767): Clean this up.
type PseudoSubscription =
  // The `foo?: void` properties are a way of saying: "this property isn't
  // here, but when I read it just say it gets `undefined` and don't worry
  // about it."  The code below reads some properties that exist in only one
  // branch of the union, and relies on getting `undefined` in the other branch.
  | $ReadOnly<{| ...Subscription, subscribed?: void |}>
  | $ReadOnly<{|
      ...Stream,
      subscribed: boolean,
      pin_to_top?: void,
      color?: void,
      in_home_view?: void,
    |}>;

type StreamListProps = $ReadOnly<{|
  showDescriptions?: boolean,
  showSwitch?: boolean,
  streams?: $ReadOnlyArray<PseudoSubscription>,
  unreadByStream?: $ReadOnly<{| [number]: number |}>,
  onPress: (streamId: number, streamName: string) => void,
  onSwitch?: (streamId: number, streamName: string, newValue: boolean) => void,
|}>;

// TODO(#3767): Simplify this by specializing to its one caller.
function StreamList(props: StreamListProps): Node {
  const {
    streams = [],
    showDescriptions = false,
    showSwitch = false,
    unreadByStream = {},
    onPress,
    onSwitch,
  } = props;

  if (streams.length === 0) {
    return <SearchEmptyState text="No streams found" />;
  }

  const sortedStreams: $ReadOnlyArray<PseudoSubscription> = streams
    .slice()
    .sort((a, b) => caseInsensitiveCompareFunc(a.name, b.name));
  const sections = [
    {
      key: 'Pinned',
      data: sortedStreams.filter(x => x.pin_to_top),
    },
    {
      key: 'Unpinned',
      data: sortedStreams.filter(x => !x.pin_to_top),
    },
  ];

  return (
    <SectionList
      style={listStyles.list}
      sections={sections}
      extraData={unreadByStream}
      initialNumToRender={20}
      keyExtractor={item => item.stream_id}
      renderItem={({ item }: { item: PseudoSubscription, ... }) => (
        <StreamItem
          streamId={item.stream_id}
          name={item.name}
          iconSize={16}
          isPrivate={item.invite_only}
          isWebPublic={item.is_web_public}
          description={showDescriptions ? item.description : ''}
          color={item.color}
          unreadCount={unreadByStream[item.stream_id]}
          isMuted={item.in_home_view === false} // if 'undefined' is not muted
          showSwitch={showSwitch}
          isSubscribed={item.subscribed}
          onPress={onPress}
          onSwitch={onSwitch}
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
      <StreamList streams={subscriptions} unreadByStream={unreadByStream} onPress={handleNarrow} />
    </View>
  );
}
