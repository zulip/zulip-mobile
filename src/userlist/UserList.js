import React, { Component } from 'react';
import {
  StyleSheet,
  ListView,
  Text,
} from 'react-native';
import UserItem from './UserItem';
import { sortUserList, filterUserList, groupUsersByInitials } from './userListSelectors';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
});

export default class UserList extends Component {

  props: {
    ownEmail: string,
    filter: string,
    users: any[],
    onNarrow: (email: string) => void,
  }

  render() {
    const { ownEmail, filter, users, onNarrow } = this.props;
    const ds = new ListView.DataSource({
      rowHasChanged: (r1, r2) => r1 !== r2,
      sectionHeaderHasChanged: (s1, s2) => s1 !== s2,
    });
    const shownUsers = sortUserList(filterUserList(users, filter, ownEmail)).toJS();
    const groupedUsers = groupUsersByInitials(shownUsers);
    const dataSource = ds.cloneWithRowsAndSections(groupedUsers);

    return (
      <ListView
        enableEmptySections
        style={styles.container}
        dataSource={dataSource}
        pageSize={12}
        renderRow={(x =>
          <UserItem
            key={x.email}
            fullName={x.fullName}
            avatarUrl={x.avatarUrl}
            email={x.email}
            status={x.status}
            onPress={onNarrow}
          />
        )}
        renderSectionHeader={(xx, x) => <Text>{x}</Text>}
      />
    );
  }
}
