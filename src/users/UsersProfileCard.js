/* @flow strict-local */

import React, { useCallback } from 'react';
import type { Node } from 'react';

import type { UserOrBot } from '../types';
import { useSelector } from '../react-redux';
import UserList from './UserList';
import { getUsers, getPresence } from '../selectors';
import { useNavigation } from '../react-navigation';

type Props = $ReadOnly<{|
  filter: string,
|}>;

export default function UsersProfileCard(props: Props): Node {
  const { filter } = props;
  const users = useSelector(getUsers);
  const presences = useSelector(getPresence);

  const navigation = useNavigation();
  const handleUserNarrow = useCallback(
    (user: UserOrBot) => {
      navigation.push('account-details', { userId: user.user_id });
    },
    [navigation],
  );

  return (
    <UserList users={users} filter={filter} presences={presences} onPress={handleUserNarrow} />
  );
}
