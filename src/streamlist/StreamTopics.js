import React from 'react';
import { StyleSheet, View, Text, ListView} from 'react-native';


export default class StreamTopics extends React.PureComponent {
  constructor() {
    super();
    const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

    this.state = {
      dataSource: ds.cloneWithRows(['topcic1', 'topic2'])
    }
  }

  render() {
    return (
        <ListView
          dataSource={this.state.dataSource}
          renderRow={(rowData) => <Text>{rowData}</Text>}
        />
    );
  }
}
