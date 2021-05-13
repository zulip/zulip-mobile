/* @flow strict-local */
import React, { PureComponent } from 'react';
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

type PseudoSubscription = Subscription | {| ...Stream, subscribed: boolean, pin_to_top?: void |};

type Props = $ReadOnly<{|
  showDescriptions: boolean,
  showToSubscribe: boolean,
  streams: $ReadOnlyArray<PseudoSubscription>,
  unreadByStream: $ReadOnly<{| [number]: number |}>,
  onPress: (streamName: string) => void,
  onSubscribe?: (streamName: string, value: boolean) => void,
|}>;

export default class StreamList extends PureComponent<Props> {
  static defaultProps = {
    showDescriptions: false,
    showToSubscribe: false,
    streams: [],
    unreadByStream: {},
  };

  render() {
    const {
      streams,
      showDescriptions,
      showToSubscribe,
      unreadByStream,
      onPress,
      onSubscribe,
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
            description={showDescriptions ? item.description : ''}
            color={item.color}
            unreadCount={unreadByStream[item.stream_id]}
            isMuted={item.in_home_view === false} // if 'undefined' is not muted
            showToSubscribe={showToSubscribe}
            isSubscribed={item.subscribed}
            onPress={onPress}
            onSubscribe={onSubscribe}
          />
        )}
        SectionSeparatorComponent={SectionSeparatorBetween}
      />
    );
  }
}
