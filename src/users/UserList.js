/* @flow strict-local */
import React from 'react';
import { SectionList } from 'react-native';
import { useSelector } from '../react-redux';

import type { PresenceState, UserOrBot } from '../types';
import { createStyleSheet } from '../styles';
import { SectionHeader, SearchEmptyState } from '../common';
import UserItem from './UserItem';
import { sortUserList, filterUserList, groupUsersByStatus } from './userHelpers';
import { getMutedUsers } from '../selectors';

const styles = createStyleSheet({
  list: {
    flex: 1,
  },
});

type Props = $ReadOnly<{|
  filter: string,
  users: $ReadOnlyArray<UserOrBot>,
  selected?: $ReadOnlyArray<UserOrBot>,
  presences: PresenceState,
  onPress: (user: UserOrBot) => void,
|}>;

export default function UserList(props: Props): React$Node {
  const { filter, users, presences, onPress, selected = [] } = props;
  const mutedUsers = useSelector(getMutedUsers);
  const filteredUsers = filterUserList(users, filter).filter(user => !mutedUsers.has(user.user_id));

  if (filteredUsers.length === 0) {
    return <SearchEmptyState text="No users found" />;
  }

  const sortedUsers = sortUserList(filteredUsers, presences);
  const groupedUsers = groupUsersByStatus(sortedUsers, presences);
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
          // $FlowFixMe[incompatible-type]
          <SectionHeader text={section.key} />
        )
      }
    />
  );
}
