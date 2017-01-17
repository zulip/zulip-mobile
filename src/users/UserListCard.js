import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';

import { privateNarrow } from '../utils/narrow';
import { SearchInput } from '../common';
import UserList from './UserList';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

type Props = {
  ownEmail: string,
  realm: string,
  users: any[],
  narrow: () => void,
  presence: Object,
};

export default class UserListCard extends Component {

  props: Props;

  state = {
    filter: '',
    onNarrow: () => {},
  };

  handleFilterChange = (newFilter: string) => {
    this.setState({
      filter: newFilter,
    });
  }

  handleUserNarrow = (email: string) => {
    const { auth, popRoute, fetchMessages } = this.props;
    fetchMessages(auth, Number.MAX_SAFE_INTEGER, 20, 0, privateNarrow(email));
    popRoute();
  }

  render() {
    const { ownEmail, realm, users, presence } = this.props;
    const { filter } = this.state;

    return (
      <View style={styles.container}>
        <SearchInput onChange={this.handleFilterChange} />
        <UserList
          ownEmail={ownEmail}
          users={users}
          presence={presence}
          filter={filter}
          realm={realm}
          onNarrow={this.handleUserNarrow}
        />
      </View>
    );
  }
}
