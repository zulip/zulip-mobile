/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet, SectionList } from 'react-native';

import { StyleObj, User } from '../types';
import { RawLabel, SearchEmptyState } from '../common';
import UserItem from './UserItem';
import { sortUserList, filterUserList, groupUsersByStatus } from '../users/userHelpers';

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  groupHeader: {
    fontWeight: 'bold',
    paddingLeft: 8,
    fontSize: 18,
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
    const shownUsers = sortUserList(filterUserList(users, filter));
    const groupedUsers = groupUsersByStatus(shownUsers, presences);
    const sections = Object.keys(groupedUsers).map(key => ({ key, data: groupedUsers[key] }));

    if (shownUsers.length === 0) {
      return <SearchEmptyState text="No users found" />;
    }

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
            status={item.status}
            isSelected={selected.find(user => user.id === item.id)}
          />
        )}
        renderSectionHeader={({ section }) => (
          // $FlowFixMe
          <RawLabel
            style={[styles.groupHeader, this.context.styles.backgroundColor]}
            text={section.key}
          />
        )}
      />
    );
  }
}
