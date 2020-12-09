/* @flow strict-local */
import React, { PureComponent } from 'react';
import { SectionList } from 'react-native';

import type { PresenceState, UserOrBot } from '../types';
import { createStyleSheet } from '../styles';
import { SectionHeader, SearchEmptyState } from '../common';
import UserItem from './UserItem';
import { sortUserList, filterUserList, groupUsersByStatus } from './userHelpers';

const styles = createStyleSheet({
  list: {
    flex: 1,
  },
});

type Props = $ReadOnly<{|
  filter: string,
  users: $ReadOnlyArray<UserOrBot>,
  selected: $ReadOnlyArray<UserOrBot>,
  presences: PresenceState,
  onPress: (user: UserOrBot) => void,
|}>;

export default class UserList extends PureComponent<Props> {
  static defaultProps = {
    selected: [],
  };

  render() {
    const { filter, users, presences, onPress, selected } = this.props;
    const shownUsers = sortUserList(filterUserList(users, filter), presences);

    if (shownUsers.length === 0) {
      return <SearchEmptyState text="No users found" />;
    }

    const groupedUsers = groupUsersByStatus(shownUsers, presences);
    const sections = Object.keys(groupedUsers).map(key => ({
      key: `${key.charAt(0).toUpperCase()}${key.slice(1)}`,
      data: groupedUsers[key].map(u => u.user_id),
    }));

    return (
      <SectionList
        style={styles.list}
        stickySectionHeadersEnabled
        keyboardShouldPersistTaps="always"
        initialNumToRender={20}
        sections={sections}
        keyExtractor={item => item}
        renderItem={({ item }) => (
          <UserItem
            key={item}
            userId={item}
            onPress={onPress}
            isSelected={!!selected.find(user => user.user_id === item)}
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
