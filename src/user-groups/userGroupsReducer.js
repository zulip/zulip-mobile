/* @flow strict-local */
import type { UserGroupsState, PerAccountApplicableAction } from '../types';
import {
  REGISTER_COMPLETE,
  EVENT,
  EVENT_USER_GROUP_ADD,
  EVENT_USER_GROUP_REMOVE,
  EVENT_USER_GROUP_UPDATE,
  EVENT_USER_GROUP_ADD_MEMBERS,
  EVENT_USER_GROUP_REMOVE_MEMBERS,
  RESET_ACCOUNT_DATA,
} from '../actionConstants';
import { EventTypes } from '../api/eventTypes';
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

export default (
  state: UserGroupsState = initialState, // eslint-disable-line default-param-last
  action: PerAccountApplicableAction,
): UserGroupsState => {
  switch (action.type) {
    case RESET_ACCOUNT_DATA:
      return initialState;

    case REGISTER_COMPLETE:
      return action.data.realm_user_groups;

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

    case EVENT: {
      const { event } = action;
      switch (event.type) {
        case EventTypes.realm_user: {
          switch (event.op) {
            case 'update': {
              const { person } = event;
              if (person.is_active === false) {
                return state.map(g => ({
                  ...g,
                  members: g.members.filter(m => m !== person.user_id),
                }));
              }

              return state;
            }

            default:
              return state;
          }
        }

        default:
          return state;
      }
    }

    default:
      return state;
  }
};
