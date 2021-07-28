/* @flow strict-local */
import React from 'react';
import { FlatList } from 'react-native';
import { useSelector } from '../react-redux';

import type { PresenceState, UserOrBot } from '../types';
import { createStyleSheet } from '../styles';
import { SearchEmptyState } from '../common';
import UserItem, { USER_ITEM_HEIGHT } from './UserItem';
import { sortUserList, filterUserList } from './userHelpers';
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

  const sortedUsers = sortUserList(filteredUsers, presences).map(user => user.user_id);

  return (
    <FlatList
      style={styles.list}
      data={sortedUsers}
      keyboardShouldPersistTaps="always"
      initialNumToRender={20}
      getItemLayout={(data, index) => ({
        length: USER_ITEM_HEIGHT,
        offset: USER_ITEM_HEIGHT * index,
        index,
      })}
      renderItem={({ item }) => (
        <UserItem
          key={item}
          userId={item}
          onPress={onPress}
          isSelected={!!selected.find(user => user.user_id === item)}
        />
      )}
    />
  );
}
