/* @flow */
import React, { PureComponent } from 'react';
import { SectionList, StyleSheet } from 'react-native';

import type { Stream } from '../types';
import { caseInsensitiveCompareObjFunc } from '../utils/misc';
import StreamItem from './StreamItem';
import { SectionSeparatorBetween, SearchEmptyState } from '../common';

const styles = StyleSheet.create({
  list: {
    flex: 1,
    flexDirection: 'column',
  },
});

type Props = {
  showDescriptions: boolean,
  showSwitch: boolean,
  selected: boolean | string, // TODO type: pick one
  streams: Stream[],
  unreadByStream: number[],
  onPress: (streamName: string) => void,
  onSwitch?: (streamName: string, newValue: boolean) => void,
};

export default class StreamList extends PureComponent<Props> {
  props: Props;

  static defaultProps = {
    showDescriptions: false,
    showSwitch: false,
    selected: false,
    streams: [],
    unreadByStream: [],
  };

  render() {
    const {
      streams,
      selected,
      showDescriptions,
      showSwitch,
      unreadByStream,
      onPress,
      onSwitch,
    } = this.props;

    if (streams.length === 0) {
      return <SearchEmptyState text="No streams found" />;
    }

    const sortedStreams = streams.sort(caseInsensitiveCompareObjFunc('name'));
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
        keyExtractor={item => item.stream_id}
        renderItem={({ item }) => (
          <StreamItem
            name={item.name}
            iconSize={16}
            isPrivate={item.invite_only}
            description={showDescriptions ? item.description : ''}
            color={item.color}
            unreadCount={unreadByStream[item.stream_id]}
            isSelected={item.name === selected}
            isMuted={item.in_home_view === false} // if 'undefined' is not muted
            showSwitch={showSwitch}
            isSwitchedOn={item.subscribed}
            onPress={onPress}
            onSwitch={onSwitch}
          />
        )}
        SectionSeparatorComponent={SectionSeparatorBetween}
      />
    );
  }
}
