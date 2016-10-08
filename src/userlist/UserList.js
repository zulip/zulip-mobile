import React, { Component } from 'react';
import {
  StyleSheet,
  ListView,
} from 'react-native';
import UserItem from './UserItem';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
});

const filterUsers = (users: any[], filter: string): any[] =>
  users.filter(x =>
    filter === '' ||
    x.get('fullName').toLowerCase().includes(filter.toLowerCase()) ||
    x.get('email').toLowerCase().includes(filter.toLowerCase())
  );

const statusOrder = {
  active: 1,
  idle: 2,
  offline: 3,
};

const sortUsers = (users: any[]): any[] =>
  users.sort((x1, x2) =>
    statusOrder[x1.get('status')] - statusOrder[x2.get('status')] ||
    x1.get('fullName').localeCompare(x2.get('fullName'))
  );

export default class UserList extends Component {

  props: {
    filter: string,
    users: any[],
    onNarrow: (email: string) => void,
  }

  render() {
    const { users, filter, onNarrow } = this.props;
    const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
    const shownUsers = sortUsers(filterUsers(users, filter));
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
