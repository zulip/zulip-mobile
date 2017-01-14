import React, { Component } from 'react';
import {
  StyleSheet,
  ListView,
} from 'react-native';

import { getFullUrl } from '../utils/url';
import UserItem from './UserItem';
import UserGroup from './UserGroup';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  groupHeader: {
    fontWeight: 'bold',
    paddingLeft: 8,
    fontSize: 18,
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
    const { conversations, users, realm, onNarrow } = this.props;

    const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
    const dataSource = ds.cloneWithRows(conversations);

    return (
      <ListView
        enableEmptySections
        style={styles.container}
        dataSource={dataSource}
        pageSize={12}
        renderRow={(email => {
          if (email.indexOf(',') === -1) {
            const user = users.find(x => x.email === email);

            if (!user) return null;

            return (
              <UserItem
                key={email}
                fullName={user.fullName}
                avatarUrl={getFullUrl(user.avatarUrl, realm)}
                email={email}
                status={user.status}
                onPress={onNarrow}
              />
            );
          } else {
            const emails = email.split(',');
            const allNames = emails.map(e =>
              users.find(x => x.email === e).fullName
            ).join(', ');

            return (
              <UserGroup
                key={email}
                allNames={allNames}
                onPress={onNarrow}
              />
            );
          }
        })}
      />
    );
  }
}
