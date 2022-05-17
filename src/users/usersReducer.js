/* @flow strict-local */
import type { UsersState, PerAccountApplicableAction } from '../types';
import {
  LOGOUT,
  LOGIN_SUCCESS,
  ACCOUNT_SWITCH,
  REGISTER_COMPLETE,
  EVENT_USER_ADD,
  EVENT_USER_REMOVE,
  EVENT,
} from '../actionConstants';
import { EventTypes } from '../api/eventTypes';
import { NULL_ARRAY } from '../nullObjects';

const initialState: UsersState = NULL_ARRAY;

export default (
  state: UsersState = initialState,
  action: PerAccountApplicableAction,
): UsersState => {
  switch (action.type) {
    case LOGOUT:
    case LOGIN_SUCCESS:
    case ACCOUNT_SWITCH:
      return initialState;

    case REGISTER_COMPLETE:
      return action.data.realm_users;

    case EVENT_USER_ADD:
      return [...state, action.person];

    case EVENT_USER_REMOVE:
      return state; // TODO

    case EVENT: {
      const { event } = action;
      switch (event.type) {
        case EventTypes.realm_user: {
          switch (event.op) {
            case 'update': {
              return state.map(user => {
                if (user.user_id !== event.person.user_id) {
                  return user;
                }
                if (event.person.avatar_url || event.person.role) {
                  return { ...user, ...event.person };
                } else {
                  return user;
                }
              });
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
