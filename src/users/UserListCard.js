/* @flow */
import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';

import type { Actions } from '../types';
import { privateNarrow } from '../utils/narrow';
import UserList from './UserList';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

type Props = {
  actions: Actions,
  ownEmail: string,
  realm: string,
  users: any[],
  narrow: () => void,
  presence: Object,
  filter: string,
};

export default class UserListCard extends Component {

  props: Props;

  state = {
    onNarrow: () => {},
  };

  handleUserNarrow = (email: string) => {
    const { actions } = this.props;
    actions.doNarrow(privateNarrow(email));
    actions.popRoute();
  };

  render() {
    const { ownEmail, realm, users, presence, filter } = this.props;

    return (
      <View style={styles.container}>
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
