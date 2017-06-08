import React from 'react';
import { FlatList } from 'react-native';

import StreamItem from './StreamItem';

export default class StreamList extends React.Component {

  props: {
    streams: [],
    selected: string,
    showDescriptions: boolean,
    showSwitch: boolean,
    onNarrow: (streamName: string) => {},
    onSwitch: (streamName: string) => {},
  }

  render() {
    const { streams, selected, showDescriptions,
      showSwitch, onNarrow, onSwitch, shareScreen } = this.props;
    const sortedStreams = Object.values(streams)
      .sort((a, b) => a.name.localeCompare(b.name));

    return (
      <FlatList
        initialNumToRender={sortedStreams.length}
        data={sortedStreams}
        keyExtractor={item => item.stream_id}
        renderItem={({ item }) => (
          <StreamItem
            name={item.name}
            iconSize={16}
            isPrivate={item.invite_only}
            description={showDescriptions && item.description}
            color={item.color}
            isSelected={item.name === selected}
            isMuted={item.in_home_view === false} // if 'undefined' is not muted
            showSwitch={showSwitch}
            isSwitchedOn={item.subscribed}
            onPress={onNarrow}
            onSwitch={onSwitch}
            shareScreen={shareScreen}
          />
        )}
      />
    );
  }
}
