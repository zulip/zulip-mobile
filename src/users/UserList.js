import React, { Component } from 'react';
import { StyleSheet, ListView, Text } from 'react-native';

import { getFullUrl } from '../utils/url';
import UserItem from './UserItem';
import { sortUserList, filterUserList, groupUsersByInitials } from './usersSelectors';

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

export default class UserList extends Component {

  props: {
    ownEmail: string,
    filter: string,
    users: any[],
    onNarrow: (email: string) => void,
  }

  render() {
    const { ownEmail, realm, filter, users, onNarrow } = this.props;
    const ds = new ListView.DataSource({
      rowHasChanged: (r1, r2) => r1 !== r2,
      sectionHeaderHasChanged: (s1, s2) => s1 !== s2,
    });
    const shownUsers = sortUserList(filterUserList(users, filter, ownEmail));
    const groupedUsers = groupUsersByInitials(shownUsers);
    const dataSource = ds.cloneWithRowsAndSections(groupedUsers);

    return (
      <ListView
        enableEmptySections
        style={styles.container}
        dataSource={dataSource}
        pageSize={12}
        renderRow={(user =>
          <UserItem
            key={user.email}
            fullName={user.fullName}
            avatarUrl={getFullUrl(user.avatarUrl, realm)}
            email={user.email}
            status={user.status}
            onPress={onNarrow}
          />
        )}
        renderSectionHeader={(xx, x) =>
          <Text style={styles.groupHeader}>{x}</Text>
        }
      />
    );
  }
}
