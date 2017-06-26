/* @flow */
import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';

import type { DoNarrowAction, PopRouteAction } from '../types';
import { privateNarrow } from '../utils/narrow';
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
  filter: string,
  doNarrow: DoNarrowAction,
  popRoute: PopRouteAction,
};

export default class UserListCard extends Component {

  props: Props;

  state = {
    onNarrow: () => {},
  };

  handleUserNarrow = (email: string) => {
    const { popRoute, doNarrow } = this.props;
    doNarrow(privateNarrow(email));
    popRoute();
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
