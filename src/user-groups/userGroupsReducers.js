/* @flow */
import type {
  UserGroupsState,
  UserGroupsAction,
  RealmInitAction,
  EventUserGroupAddAction,
  EventUserGroupRemoveAction,
  EventUserGroupUpdateAction,
  EventUserGroupAddMembersAction,
} from '../types';
import {
  LOGOUT,
  LOGIN_SUCCESS,
  ACCOUNT_SWITCH,
  REALM_INIT,
  EVENT_USER_GROUP_ADD,
  EVENT_USER_GROUP_REMOVE,
  EVENT_USER_GROUP_UPDATE,
  EVENT_USER_GROUP_ADD_MEMBERS,
} from '../actionConstants';
import { NULL_ARRAY } from '../nullObjects';

const initialState: UserGroupsState = NULL_ARRAY;

const realmInit = (state: UserGroupsState, action: RealmInitAction): UserGroupsState =>
  action.data.realm_user_groups;

const eventUserGroupAdd = (
  state: UserGroupsState,
  action: EventUserGroupAddAction,
): UserGroupsState => [...state, action.group];

const eventUserGroupRemove = (
  state: UserGroupsState,
  action: EventUserGroupRemoveAction,
): UserGroupsState => state.filter(x => action.group_id !== x.id);

const eventUserGroupUpdate = (
  state: UserGroupsState,
  action: EventUserGroupUpdateAction,
): UserGroupsState =>
  state.map(
    userGroup =>
      action.group_id !== userGroup.id
        ? userGroup
        : {
            ...userGroup,
            ...action.data,
          },
  );

const eventUserGroupAddMembers = (
  state: UserGroupsState,
  action: EventUserGroupAddMembersAction,
): UserGroupsState =>
  state.map(
    userGroup =>
      action.group_id !== userGroup.id
        ? userGroup
        : {
            ...userGroup,
            members: [...userGroup.members, ...action.user_ids],
          },
  );

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

    case EVENT_USER_GROUP_REMOVE:
      return eventUserGroupRemove(state, action);

    case EVENT_USER_GROUP_UPDATE:
      return eventUserGroupUpdate(state, action);

    case EVENT_USER_GROUP_ADD_MEMBERS:
      return eventUserGroupAddMembers(state, action);

    default:
      return state;
  }
};
