/* @flow strict-local */
import type { UserGroupsState, Action } from '../types';
import {
  LOGOUT,
  LOGIN_SUCCESS,
  ACCOUNT_SWITCH,
  REGISTER_COMPLETE,
  EVENT_USER_GROUP_ADD,
  EVENT_USER_GROUP_REMOVE,
  EVENT_USER_GROUP_UPDATE,
  EVENT_USER_GROUP_ADD_MEMBERS,
  EVENT_USER_GROUP_REMOVE_MEMBERS,
} from '../actionConstants';
import { NULL_ARRAY } from '../nullObjects';

const initialState: UserGroupsState = NULL_ARRAY;

const eventUserGroupUpdate = (state, action) =>
  state.map(userGroup =>
    action.group_id !== userGroup.id
      ? userGroup
      : {
          ...userGroup,
          ...action.data,
        },
  );

const eventUserGroupAddMembers = (state, action) =>
  state.map(userGroup =>
    action.group_id !== userGroup.id
      ? userGroup
      : {
          ...userGroup,
          members: [...userGroup.members, ...action.user_ids],
        },
  );

const eventUserGroupRemoveMembers = (state, action) =>
  state.map(userGroup =>
    action.group_id !== userGroup.id
      ? userGroup
      : {
          ...userGroup,
          members: userGroup.members.filter(x => !action.user_ids.includes(x)),
        },
  );

export default (state: UserGroupsState = initialState, action: Action): UserGroupsState => {
  switch (action.type) {
    case LOGOUT:
    case LOGIN_SUCCESS:
    case ACCOUNT_SWITCH:
      return initialState;

    case REGISTER_COMPLETE:
      return action.data.realm_user_groups || initialState;

    case EVENT_USER_GROUP_ADD:
      return [...state, action.group];

    case EVENT_USER_GROUP_REMOVE:
      return state.filter(x => action.group_id !== x.id);

    case EVENT_USER_GROUP_UPDATE:
      return eventUserGroupUpdate(state, action);

    case EVENT_USER_GROUP_ADD_MEMBERS:
      return eventUserGroupAddMembers(state, action);

    case EVENT_USER_GROUP_REMOVE_MEMBERS:
      return eventUserGroupRemoveMembers(state, action);

    default:
      return state;
  }
};
