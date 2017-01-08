import React from 'react';
import { ListView } from 'react-native';

import StreamItem from './StreamItem';

export default class StreamSidebar extends React.Component {

  props: {
    subscriptions: [],
    onNarrow: (streamName: string) => {},
  }

  render() {
    const { subscriptions, onNarrow } = this.props;
    const sortedSubscriptions = Object.values(subscriptions)
      .sort((a, b) => a.name.localeCompare(b.name));
    const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
    const dataSource = ds.cloneWithRows(sortedSubscriptions);

    return (
      <ListView
        enableEmptySections
        dataSource={dataSource}
        renderRow={(x =>
          <StreamItem
            key={x.stream_id}
            name={x.name}
            description={x.description}
            iconSize={16}
            isPrivate={x.invite_only}
            color={x.color}
            onPress={onNarrow}
          />
        )}
      />
    );
  }
}
