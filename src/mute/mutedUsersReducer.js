/* @flow strict-local */
import Immutable from 'immutable';

import type { MutedUsersState, Action, UserId } from '../types';
import {
  REALM_INIT,
  LOGIN_SUCCESS,
  LOGOUT,
  ACCOUNT_SWITCH,
  EVENT_MUTED_USERS,
} from '../actionConstants';
import type { MutedUser } from '../api/apiTypes';

const initialState: MutedUsersState = Immutable.Map();

function mutedUsersToMap(muted_users: $ReadOnlyArray<MutedUser>): Immutable.Map<UserId, number> {
  return Immutable.Map(muted_users.map(muted_user => [muted_user.id, muted_user.timestamp]));
}

export default (state: MutedUsersState = initialState, action: Action): MutedUsersState => {
  switch (action.type) {
    case LOGOUT:
    case ACCOUNT_SWITCH:
    case LOGIN_SUCCESS:
      return initialState;

    case REALM_INIT:
      return mutedUsersToMap(action.data.muted_users ?? []);

    case EVENT_MUTED_USERS:
      return mutedUsersToMap(action.muted_users);

    default:
      return state;
  }
};
