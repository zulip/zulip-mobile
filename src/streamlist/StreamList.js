/* @flow */
import React from 'react';
import { FlatList, StyleSheet } from 'react-native';

import StreamItem from './StreamItem';

const styles = StyleSheet.create({
  list: {
    flex: 1,
    flexDirection: 'column',
  },
});

export default class StreamList extends React.Component {
  props: {
    streams: Object[],
    selected?: boolean,
    showDescriptions: boolean,
    showSwitch: boolean,
    onNarrow: (streamName: string) => void,
    onSwitch: (streamName: string, newValue: boolean) => void,
  };

  static defaultProps: {
    showSwitch: false,
    showDescriptions: false,
    onSwitch: (streamName: string, newValue: boolean) => void,
    selected: false,
  };

  render() {
    const { streams, selected, showDescriptions, showSwitch, onNarrow, onSwitch } = this.props;
    const sortedStreams = streams.sort((a, b) => a.name.localeCompare(b.name));

    return (
      <FlatList
        style={styles.list}
        initialNumToRender={sortedStreams.length}
        data={sortedStreams}
        keyExtractor={item => item.stream_id}
        renderItem={({ item }) =>
          <StreamItem
            name={item.name}
            iconSize={16}
            isPrivate={item.invite_only}
            description={showDescriptions ? item.description : ''}
            color={item.color}
            isSelected={item.name === selected}
            isMuted={item.in_home_view === false} // if 'undefined' is not muted
            showSwitch={showSwitch}
            isSwitchedOn={item.subscribed}
            onPress={onNarrow}
            onSwitch={onSwitch}
          />}
      />
    );
  }
}
