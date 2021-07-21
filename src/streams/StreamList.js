/* @flow strict-local */
import React from 'react';
import type { Node } from 'react';
import { SectionList } from 'react-native';

import type { Stream, Subscription } from '../types';
import { createStyleSheet } from '../styles';
import { caseInsensitiveCompareFunc } from '../utils/misc';
import StreamItem from './StreamItem';
import { SectionSeparatorBetween, SearchEmptyState } from '../common';

const styles = createStyleSheet({
  list: {
    flex: 1,
    flexDirection: 'column',
  },
});

// This component's callers have a legacy hack where they pass ad-hoc sets
// of properties that are different between the two callers.
//
// This drives some visible differences in behavior, some of which are
// desired.
//
// We should clean this up: #3767.  Until then, this type describes the
// existing data flow.
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

type Props = $ReadOnly<{|
  showDescriptions?: boolean,
  showSwitch?: boolean,
  streams?: $ReadOnlyArray<PseudoSubscription>,
  unreadByStream?: $ReadOnly<{| [number]: number |}>,
  onPress: (streamName: string) => void,
  onSwitch?: (streamName: string, newValue: boolean) => void,
|}>;

export default function StreamList(props: Props): Node {
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

  const sortedStreams: PseudoSubscription[] = streams
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
      style={styles.list}
      sections={sections}
      extraData={unreadByStream}
      initialNumToRender={20}
      keyExtractor={item => item.stream_id}
      renderItem={({ item }: { item: PseudoSubscription, ... }) => (
        <StreamItem
          name={item.name}
          iconSize={16}
          isPrivate={item.invite_only}
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
