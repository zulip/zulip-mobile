import React, { Component } from 'react';
import { StyleSheet, SectionList, Text } from 'react-native';

import { getFullUrl } from '../utils/url';
import UserItem from './UserItem';
import { sortUserList, filterUserList, groupUsersByInitials } from './usersSelectors';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  groupHeader: {
    fontWeight: 'bold',
    paddingLeft: 8,
    fontSize: 18,
  }
});

export default class UserList extends Component {

  props: {
    ownEmail: string,
    filter: string,
    users: any[],
    onNarrow: (email: string) => void,
  }

  render() {
    const { ownEmail, realm, filter, users, onNarrow } = this.props;
    const shownUsers = sortUserList(filterUserList(users, filter, ownEmail));
    const groupedUsers = groupUsersByInitials(shownUsers);
    const sections = Object.entries(groupedUsers).map(x => ({ key: x[0], data: x[1] }));

    return (
      <SectionList
        style={styles.container}
        enableEmptySections
        sections={sections}
        keyExtractor={item => item.email}
        renderItem={({ item }) =>
          <UserItem
            fullName={item.fullName}
            avatarUrl={getFullUrl(item.avatarUrl, realm)}
            email={item.email}
            status={item.status}
            onPress={onNarrow}
          />
        }
        renderSectionHeader={({ section }) =>
          <Text style={styles.groupHeader}>
            {section.key}
          </Text>
        }
      />
    );
  }
}
