/* @flow */
import type { UsersState, Action } from '../types';
import {
  APP_REFRESH,
  LOGOUT,
  LOGIN_SUCCESS,
  ACCOUNT_SWITCH,
  EVENT_PRESENCE,
  PRESENCE_RESPONSE,
  REALM_INIT,
} from '../actionConstants';
import { NULL_OBJECT } from '../nullObjects';

const initialState: Object = NULL_OBJECT;

export default (state: UsersState = initialState, action: Action): UsersState => {
  switch (action.type) {
    case APP_REFRESH:
    case LOGOUT:
    case LOGIN_SUCCESS:
    case ACCOUNT_SWITCH:
      return initialState;

    case REALM_INIT:
      return action.data.presences;

    case PRESENCE_RESPONSE:
      return {
        ...state,
        ...action.presence,
      };

    case EVENT_PRESENCE:
      return {
        ...state,
        [action.email]: action.presence,
      };

    default:
      return state;
  }
};
