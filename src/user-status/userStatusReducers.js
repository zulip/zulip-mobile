/* @flow strict-local */
import type { UserStatusState, Action } from '../types';
import { LOGOUT, LOGIN_SUCCESS, ACCOUNT_SWITCH, REALM_INIT } from '../actionConstants';
import { NULL_OBJECT } from '../nullObjects';

const initialState: UserStatusState = NULL_OBJECT;

export default (state: UserStatusState = initialState, action: Action): UserStatusState => {
  switch (action.type) {
    case LOGOUT:
    case LOGIN_SUCCESS:
    case ACCOUNT_SWITCH:
      return initialState;

    case REALM_INIT:
      return action.data.user_status || initialState;

    default:
      return state;
  }
};
