/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet, SectionList } from 'react-native';

import type { StyleObj, User } from '../types';
import { SectionHeader, SearchEmptyState } from '../common';
import UserItem from './UserItem';
import { sortUserList, filterUserList, groupUsersByStatus } from '../users/userHelpers';

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
});

type Props = {
  style?: StyleObj,
  filter: string,
  users: User[],
  selected: User[],
  presences: Object,
  onPress: (email: string) => void,
};

export default class UserList extends PureComponent<Props> {
  static contextTypes = {
    styles: () => null,
  };

  props: Props;

  static defaultProps = {
    selected: [],
  };

  render() {
    const { filter, style, users, presences, onPress, selected } = this.props;
    const shownUsers = sortUserList(filterUserList(users, filter), presences);

    if (shownUsers.length === 0) {
      return <SearchEmptyState text="No users found" />;
    }

    const groupedUsers = groupUsersByStatus(shownUsers, presences);
    const sections = Object.keys(groupedUsers).map(key => ({
      key: `${key.charAt(0).toUpperCase()}${key.slice(1)}`,
      data: groupedUsers[key],
    }));

    return (
      <SectionList
        style={[styles.list, style]}
        stickySectionHeadersEnabled
        keyboardShouldPersistTaps="always"
        initialNumToRender={20}
        sections={sections}
        exraData={presences}
        keyExtractor={item => item.email}
        renderItem={({ item }) => (
          <UserItem
            key={item.email}
            fullName={item.fullName}
            avatarUrl={item.avatarUrl}
            email={item.email}
            presence={presences[item.email]}
            onPress={onPress}
            isSelected={selected.find(user => user.id === item.id)}
          />
        )}
        renderSectionHeader={({ section }) =>
          section.data.length === 0 ? null : (
            // $FlowFixMe
            <SectionHeader text={section.key} />
          )
        }
      />
    );
  }
}
