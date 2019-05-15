/* @flow strict-local */
import isEqual from 'lodash.isequal';

import type { User, UsersState, Action } from '../types';
import {
  LOGOUT,
  LOGIN_SUCCESS,
  ACCOUNT_SWITCH,
  REALM_INIT,
  EVENT_USER_ADD,
  EVENT_USER_REMOVE,
  EVENT_USER_UPDATE,
} from '../actionConstants';
import { NULL_ARRAY } from '../nullObjects';
import { updateUser } from './userHelpers';

const initialState: UsersState = NULL_ARRAY;

export default (state: UsersState = initialState, action: Action): UsersState => {
  switch (action.type) {
    case LOGOUT:
    case LOGIN_SUCCESS:
    case ACCOUNT_SWITCH:
      return initialState;

    case REALM_INIT:
      return action.data.realm_users || initialState;

    case EVENT_USER_ADD:
      return [...state, action.person];

    case EVENT_USER_REMOVE:
      return state; // TODO

    case EVENT_USER_UPDATE: {
      const userIndex = state.findIndex(x => x.user_id === action.person.user_id);
      const oldUser: User = state[userIndex];

      if (userIndex === -1) {
        return state;
      }

      const updatedUser = updateUser(oldUser, action.person);

      if (isEqual(updatedUser, oldUser)) {
        return state;
      }

      return [...state.slice(0, userIndex), updatedUser, ...state.slice(userIndex + 1)];
    }

    default:
      return state;
  }
};
