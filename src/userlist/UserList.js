import React, { Component } from 'react';
import {
  StyleSheet,
  ListView,
} from 'react-native';
import UserItem from './UserItem';
import { sortUserList, filterUserList } from './userListSelectors';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
});

export default class UserList extends Component {

  props: {
    filter: string,
    users: any[],
    onNarrow: (email: string) => void,
  }

  render() {
    const { users, filter, onNarrow } = this.props;
    const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
    const shownUsers = sortUserList(filterUserList(users, filter));
    const dataSource = ds.cloneWithRows(shownUsers.toJS());

    return (
      <ListView
        enableEmptySections
        style={styles.container}
        dataSource={dataSource}
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
      />
    );
  }
}
