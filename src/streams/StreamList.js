/* @flow */
import React, { PureComponent } from 'react';
import { FlatList, StyleSheet } from 'react-native';

import type { Stream } from '../types';
import { caseInsensitiveCompareObjFunc } from '../utils/misc';
import StreamItem from './StreamItem';
import { SearchEmptyState } from '../common';

const styles = StyleSheet.create({
  list: {
    flex: 1,
    flexDirection: 'column',
  },
});

export default class StreamList extends PureComponent {
  props: {
    streams: Stream[],
    selected?: boolean,
    showDescriptions: boolean,
    showSwitch: boolean,
    unreadByStream: number[],
    onPress?: (streamName: string) => void,
    onSwitch?: (streamName: string, newValue: boolean) => void,
    clearInput?: () => void,
  };

  static defaultProps = {
    showSwitch: false,
    showDescriptions: false,
    selected: false,
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
      clearInput,
    } = this.props;
    const sortedStreams = streams.sort(caseInsensitiveCompareObjFunc('name'));
    const noResults = streams.length === 0;

    if (noResults) {
      return (
        <SearchEmptyState
          text="No streams found"
          buttonText="All streams"
          buttonAction={clearInput}
        />
      );
    }

    return (
      <FlatList
        style={styles.list}
        initialNumToRender={sortedStreams.length}
        data={sortedStreams}
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
      />
    );
  }
}
