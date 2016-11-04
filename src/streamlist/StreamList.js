import React from 'react';
import {
  StyleSheet,
  ListView,
} from 'react-native';

import StreamItem from './StreamItem';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
});

export default class StreamSidebar extends React.Component {

  render() {
    const sortedSubscriptions = this.props.subscriptions.toList().toJS()
      .sort((a, b) => a.name.localeCompare(b.name));
    const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
    const dataSource = ds.cloneWithRows(sortedSubscriptions);

    return (
      <ListView
        enableEmptySections
        style={styles.container}
        dataSource={dataSource}
        renderRow={(x =>
          <StreamItem
            key={x.stream_id}
            name={x.name}
            // onPress={onNarrow}
          />
        )}
      />
    );
  }
}
