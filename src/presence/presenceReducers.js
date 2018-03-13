/* @flow */
import type { PresenceState, Action } from '../types';
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

const initialState: PresenceState = NULL_OBJECT;

export default (state: PresenceState = initialState, action: Action): PresenceState => {
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

    case EVENT_PRESENCE: {
      const { email } = action;
      return {
        ...state,
        [email]: { ...state[email], ...action.presence },
      };
    }

    default:
      return state;
  }
};
