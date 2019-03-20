/* @flow strict-local */
import type { UsersState, Action } from '../types';
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

const initialState: UsersState = NULL_ARRAY;

const findUser = (state: UsersState, email: string): number =>
  state.findIndex(user => user.email && user.email === email);

const updateUser = (state, action) => {
  const { email, newAccountDetails } = action;
  const userIndex = findUser(state, email);

  return [
    { ...state[userIndex], ...newAccountDetails },
    ...state.slice(0, userIndex),
    ...state.slice(userIndex + 1),
  ];
};

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

    case EVENT_USER_UPDATE:
      return updateUser(state, action);

    default:
      return state;
  }
};
