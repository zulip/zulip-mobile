/* @flow strict-local */

import React, { useCallback } from 'react';

import * as NavigationService from '../nav/NavigationService';
import type { Dispatch, PresenceState, User, UserOrBot } from '../types';
import { connect } from '../react-redux';
import { pm1to1NarrowFromUser } from '../utils/narrow';
import UserList from './UserList';
import { getUsers, getPresence } from '../selectors';
import { navigateBack, doNarrow } from '../actions';

type Props = $ReadOnly<{|
  dispatch: Dispatch,
  users: User[],
  filter: string,
  presences: PresenceState,
|}>;

function UsersCard(props: Props) {
  const { dispatch, users, filter, presences } = props;

  const handleUserNarrow = useCallback(
    (user: UserOrBot) => {
      NavigationService.dispatch(navigateBack());
      dispatch(doNarrow(pm1to1NarrowFromUser(user)));
    },
    [dispatch],
  );

  return (
    <UserList users={users} filter={filter} presences={presences} onPress={handleUserNarrow} />
  );
}

export default connect(state => ({
  users: getUsers(state),
  presences: getPresence(state),
}))(UsersCard);
