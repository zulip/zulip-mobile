/* @flow strict-local */
import type { User, UsersState, PerAccountApplicableAction } from '../types';
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
                const { person } = event;
                if (user.user_id !== person.user_id) {
                  return user;
                }
                if (person.custom_profile_field) {
                  return {
                    ...user,
                    profile_data: {
                      ...(user.profile_data: $PropertyType<User, 'profile_data'>),
                      [person.custom_profile_field.id]: {
                        value: person.custom_profile_field.value,
                        rendered_value: person.custom_profile_field.rendered_value,
                      },
                    },
                  };
                } else if (person.new_email !== undefined) {
                  return { ...user, email: person.new_email };
                } else {
                  return { ...user, ...person };
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
