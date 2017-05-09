import React from 'react';
import { ListView } from 'react-native';

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
    const { streams, selected, showDescriptions, showSwitch, onNarrow, onSwitch } = this.props;
    const sortedStreams = Object.values(streams)
      .sort((a, b) => a.name.localeCompare(b.name));
    const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
    const dataSource = ds.cloneWithRows(sortedStreams);
    return (
      <ListView
        enableEmptySections
        dataSource={dataSource}
        renderRow={(x => (
          <StreamItem
            key={x.stream_id}
            name={x.name}
            iconSize={16}
            isPrivate={x.invite_only}
            description={showDescriptions && x.description}
            color={x.color}
            isSelected={x.name === selected}
            isMuted={x.in_home_view === false} // if 'undefined' is not muted
            showSwitch={showSwitch}
            isSwitchedOn={x.subscribed}
            onPress={onNarrow}
            onSwitch={onSwitch}
          />
        ))}
      />
    );
  }
}
