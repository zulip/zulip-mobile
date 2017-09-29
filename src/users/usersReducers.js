/* @flow */
import type { UsersState, Action } from '../types';
import {
  LOGOUT,
  LOGIN_SUCCESS,
  ACCOUNT_SWITCH,
  INIT_USERS,
  EVENT_USER_ADD,
  EVENT_USER_REMOVE,
  EVENT_USER_UPDATE,
} from '../actionConstants';
import { NULL_ARRAY } from '../nullObjects';

const mapApiToStateUser = user => ({
  id: user.user_id,
  email: user.email,
  fullName: user.full_name,
  avatarUrl: user.avatar_url,
  isActive: user.is_active,
  isAdmin: user.is_admin,
  isBot: user.is_bot,
});

const initialState: UsersState = NULL_ARRAY;

export default (state: UsersState = initialState, action: Action): UsersState => {
  switch (action.type) {
    case LOGOUT:
    case LOGIN_SUCCESS:
    case ACCOUNT_SWITCH:
      return initialState;

    case INIT_USERS:
      return action.users.map(mapApiToStateUser);

    case EVENT_USER_ADD:
      return [...state, mapApiToStateUser(action.person)];

    case EVENT_USER_REMOVE:
      return state; // TODO

    case EVENT_USER_UPDATE:
      return state; // TODO

    default:
      return state;
  }
};
