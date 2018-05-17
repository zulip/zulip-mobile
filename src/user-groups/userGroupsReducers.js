/* @flow */
import type { UserGroupsState, UserGroupsAction, RealmInitAction } from '../types';
import { LOGOUT, LOGIN_SUCCESS, ACCOUNT_SWITCH, REALM_INIT } from '../actionConstants';
import { NULL_ARRAY } from '../nullObjects';

const initialState: UserGroupsState = NULL_ARRAY;

const realmInit = (state: UserGroupsState, action: RealmInitAction): UserGroupsState =>
  action.data.realm_user_groups;

export default (
  state: UserGroupsState = initialState,
  action: UserGroupsAction,
): UserGroupsState => {
  switch (action.type) {
    case LOGOUT:
    case LOGIN_SUCCESS:
    case ACCOUNT_SWITCH:
      return initialState;

    case REALM_INIT:
      return realmInit(state, action);

    default:
      return state;
  }
};
