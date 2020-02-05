/* @flow strict-local */
import React, { PureComponent } from 'react';
import { SectionList, StyleSheet } from 'react-native';

import type { Stream, Subscription } from '../types';
import { caseInsensitiveCompareFunc } from '../utils/misc';
import StreamItem from './StreamItem';
import { SectionSeparatorBetween, SearchEmptyState } from '../common';

const styles = StyleSheet.create({
  list: {
    flex: 1,
    flexDirection: 'column',
  },
});

type PseudoSubscription = Subscription | { ...Stream, subscribed: boolean, pin_to_top?: void };

type Props = $ReadOnly<{|
  streams: $ReadOnlyArray<PseudoSubscription>,
  unreadByStream: number[],
  onPress: (streamName: string) => void,
|}>;

export default class SubscriptionsList extends PureComponent<Props> {
  static defaultProps = {
    streams: [],
    unreadByStream: [],
  };

  render() {
    const {
      streams,
      unreadByStream,
      onPress,
    } = this.props;

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
        renderItem={({ item }) => (
          <StreamItem
            name={item.name}
            iconSize={16}
            isPrivate={item.invite_only}
            color={item.color}
            unreadCount={unreadByStream[item.stream_id]}
            isMuted={item.in_home_view === false} // if 'undefined' is not muted
            onPress={onPress}
          />
        )}
        SectionSeparatorComponent={SectionSeparatorBetween}
      />
    );
  }
}
