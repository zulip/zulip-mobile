/* @flow strict-local */

import React, { useCallback } from 'react';
import type { Node } from 'react';

import type { UserOrBot } from '../types';
import { useSelector, useDispatch } from '../react-redux';
import { pm1to1NarrowFromUser } from '../utils/narrow';
import UserList from './UserList';
import { getUsers, getPresence } from '../selectors';
import { navigateBack, doNarrow } from '../actions';
import { useNavigation } from '../react-navigation';

type Props = $ReadOnly<{|
  filter: string,
|}>;

export default function UsersCard(props: Props): Node {
  const { filter } = props;
  const dispatch = useDispatch();
  const users = useSelector(getUsers);
  const presences = useSelector(getPresence);

  const navigation = useNavigation();
  const handleUserNarrow = useCallback(
    (user: UserOrBot) => {
      navigation.dispatch(navigateBack());
      dispatch(doNarrow(pm1to1NarrowFromUser(user)));
    },
    [dispatch, navigation],
  );

  return (
    <UserList users={users} filter={filter} presences={presences} onPress={handleUserNarrow} />
  );
}
