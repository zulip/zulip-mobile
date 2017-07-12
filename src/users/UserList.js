/* @flow */
import React, { Component } from 'react';
import { StyleSheet, SectionList } from 'react-native';

import { RawLabel } from '../common';
import UserItem from './UserItem';
import { sortUserList, filterUserList, groupUsersByInitials } from './usersSelectors';
import { User } from '../types';

const styles = StyleSheet.create({
  list: {
    flex: 1,
    flexDirection: 'column',
  },
  groupHeader: {
    fontWeight: 'bold',
    paddingLeft: 8,
    fontSize: 18,
  },
});

export default class UserList extends Component {
  props: {
    filter: string,
    users: User[],
    onNarrow: (email: string) => void,
    realm: string,
  };

  render() {
    const { realm, filter, users, onNarrow } = this.props;
    const shownUsers = sortUserList(filterUserList(users, filter));
    const groupedUsers = groupUsersByInitials(shownUsers);
    const sections = Object.entries(groupedUsers).map(x => ({ key: x[0], data: x[1] }));

    return (
      <SectionList
        style={styles.list}
        initialNumToRender={20}
        sections={sections}
        keyExtractor={item => item.email}
        renderItem={({ item }) =>
          <UserItem
            key={item.email}
            fullName={item.fullName}
            avatarUrl={item.avatarUrl}
            email={item.email}
            onPress={onNarrow}
            realm={realm}
          />}
        renderSectionHeader={(xx, x) => <RawLabel style={styles.groupHeader} text={x} />}
      />
    );
  }
}
