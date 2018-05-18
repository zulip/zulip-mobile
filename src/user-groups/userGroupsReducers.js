/* @flow */
import type {
  UserGroupsState,
  UserGroupsAction,
  RealmInitAction,
  EventUserGroupAddAction,
} from '../types';
import {
  LOGOUT,
  LOGIN_SUCCESS,
  ACCOUNT_SWITCH,
  REALM_INIT,
  EVENT_USER_GROUP_ADD,
} from '../actionConstants';
import { NULL_ARRAY } from '../nullObjects';

const initialState: UserGroupsState = NULL_ARRAY;

const realmInit = (state: UserGroupsState, action: RealmInitAction): UserGroupsState =>
  action.data.realm_user_groups;

const eventUserGroupAdd = (
  state: UserGroupsState,
  action: EventUserGroupAddAction,
): UserGroupsState => [...state, action.group];

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

    case EVENT_USER_GROUP_ADD:
      return eventUserGroupAdd(state, action);

    default:
      return state;
  }
};
