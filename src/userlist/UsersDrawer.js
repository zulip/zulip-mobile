import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';
import UserFilter from './UserFilter';
import UserList from './UserList';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    marginTop: 20,
  },
});

export default class UsersDrawer extends Component {

  props: {
    filter: string,
    users: string[],
  }

  render() {
    const { filter, users } = this.props;

    return (
      <View style={styles.container}>
        <UserFilter filter={filter} />
        <UserList users={users} />
      </View>
    )
  }
}
