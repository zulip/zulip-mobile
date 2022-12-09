/* @flow strict-local */
import Immutable from 'immutable';

import type { MutedUsersState, PerAccountApplicableAction, UserId } from '../types';
import { REGISTER_COMPLETE, EVENT_MUTED_USERS, RESET_ACCOUNT_DATA } from '../actionConstants';
import type { MutedUser } from '../api/apiTypes';

const initialState: MutedUsersState = Immutable.Map();

function mutedUsersToMap(muted_users: $ReadOnlyArray<MutedUser>): Immutable.Map<UserId, number> {
  return Immutable.Map(muted_users.map(muted_user => [muted_user.id, muted_user.timestamp]));
}

export default (
  state: MutedUsersState = initialState, // eslint-disable-line default-param-last
  action: PerAccountApplicableAction,
): MutedUsersState => {
  switch (action.type) {
    case RESET_ACCOUNT_DATA:
      return initialState;

    case REGISTER_COMPLETE:
      return mutedUsersToMap(action.data.muted_users ?? []);

    case EVENT_MUTED_USERS:
      return mutedUsersToMap(action.muted_users);

    default:
      return state;
  }
};
