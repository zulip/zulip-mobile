import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';


import ZulipButton from '../common/ZulipButton';
import UserFilter from './UserFilter';
import UserList from './UserList';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    marginTop: 20,
    backgroundColor: 'white',
    borderColor: 'grey',
  },
});

export default class UsersDrawer extends Component {

  props: {
    filter: string,
    users: string[],
  }

  logout = () => {
    this.props.logout();
  }

  render() {
    const { filter, users } = this.props;

    return (
      <View style={styles.container}>
        <ZulipButton secondary text="Logout" onPress={this.logout} />
        <UserFilter filter={filter} />
        <UserList users={users} />
      </View>
    );
  }
}
