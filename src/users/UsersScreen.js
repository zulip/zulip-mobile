/* @flow strict-local */
import React, { useCallback, useState } from 'react';
import type { Node } from 'react';

import type { RouteProp } from '../react-navigation';
import type { AppNavigationProp } from '../nav/AppNavigator';
import Screen from '../common/Screen';
import UserList from './UserList';
import type { UserOrBot } from '../types';
import { useSelector, useDispatch } from '../react-redux';
import { pm1to1NarrowFromUser } from '../utils/narrow';
import { getUsers, getPresence } from '../selectors';
import { navigateBack, doNarrow } from '../actions';
import { useNavigation } from '../react-navigation';

type Props = $ReadOnly<{|
  navigation: AppNavigationProp<'users'>,
  route: RouteProp<'users', void>,
|}>;

export default function UsersScreen(props: Props): Node {
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

  const [filter, setFilter] = useState<string>('');

  return (
    <Screen search scrollEnabled={false} searchBarOnChange={setFilter}>
      <UserList users={users} filter={filter} presences={presences} onPress={handleUserNarrow} />
    </Screen>
  );
}
