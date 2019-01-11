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

const realmInit = (state, action) => action.data.realm_users || initialState;

const eventUserAdd = (state, action) => [...state, action.person];

export default (state: UsersState = initialState, action: Action): UsersState => {
  switch (action.type) {
    case LOGOUT:
    case LOGIN_SUCCESS:
    case ACCOUNT_SWITCH:
      return initialState;

    case REALM_INIT:
      return realmInit(state, action);

    case EVENT_USER_ADD:
      return eventUserAdd(state, action);

    case EVENT_USER_REMOVE:
      return state; // TODO

    case EVENT_USER_UPDATE:
      return state; // TODO

    default:
      return state;
  }
};
