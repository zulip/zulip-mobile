import React, { Component } from 'react';
import { ListView, StyleSheet, Text } from 'react-native';

import ConversationUser from './ConversationUser';
import ConversationGroup from './ConversationGroup';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  groupHeader: {
    fontWeight: 'bold',
    paddingLeft: 8,
    fontSize: 18,
  },
  emptySlate: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
  }
});

export default class ConversationList extends Component {

  props: {
    conversations: string[],
    realm: string,
    users: any[],
    onNarrow: (email: string) => void,
  }

  render() {
    const { conversations } = this.props;

    const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
    const dataSource = ds.cloneWithRows(conversations);

    if (!conversations.length) {
      return (
        <Text style={styles.emptySlate}>
          No Recent Conversations
        </Text>
      );
    }

    return (
      <ListView
        enableEmptySections
        style={styles.container}
        dataSource={dataSource}
        pageSize={12}
        renderRow={(email => (
          email.indexOf(',') === -1 ? // if single recipient
            <ConversationUser email={email} {...this.props} /> :
            <ConversationGroup email={email} {...this.props} />
        ))}
      />
    );
  }
}
