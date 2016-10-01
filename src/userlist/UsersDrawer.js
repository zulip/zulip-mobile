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
  logoutButton: {
    marginTop: 10,
  },
});

export default class UsersDrawer extends Component {

  props: {
    filter: string,
    users: string[],
    presence: Object,
  }

  logout = () => {
    this.props.logout();
  }

  render() {
    const { filter, users, presence } = this.props;

    return (
      <View style={styles.container}>
        <UserFilter filter={filter} />
        <UserList users={users} presence={presence} />
        <ZulipButton
          customStyles={styles.logoutButton}
          secondary
          text="Logout"
          onPress={this.logout}
        />
      </View>
    );
  }
}
