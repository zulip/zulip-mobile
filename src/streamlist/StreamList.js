import React from 'react';
import {
  StyleSheet,
  ListView,
} from 'react-native';

import StreamItem from './StreamItem';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default class StreamSidebar extends React.Component {

  props: {
    subscriptions: Object,
    onNarrow: (streamName: string) => {},
  }

  render() {
    const { subscriptions, onNarrow } = this.props;
    const sortedSubscriptions = subscriptions.toList().toJS()
      .sort((a, b) => a.name.localeCompare(b.name));
    const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
    const dataSource = ds.cloneWithRows(sortedSubscriptions);

    return (
      <ListView
        enableEmptySections
        style={styles.container}
        pageSize={12}
        dataSource={dataSource}
        renderRow={(x =>
          <StreamItem
            key={x.stream_id}
            name={x.name}
            description={x.description}
            iconSize={20}
            isPrivate={x.invite_only}
            color={x.color}
            onPress={onNarrow}
          />
        )}
      />
    );
  }
}
