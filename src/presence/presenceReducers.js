/* @flow strict-local */
import type { PresenceState, Action } from '../types';
import {
  LOGOUT,
  LOGIN_SUCCESS,
  ACCOUNT_SWITCH,
  EVENT_PRESENCE,
  PRESENCE_RESPONSE,
  REALM_INIT,
} from '../actionConstants';
import { NULL_OBJECT } from '../nullObjects';
import { getAggregatedPresence } from '../utils/presence';

const initialState: PresenceState = NULL_OBJECT;

export default (state: PresenceState = initialState, action: Action): PresenceState => {
  switch (action.type) {
    case LOGOUT:
    case LOGIN_SUCCESS:
    case ACCOUNT_SWITCH:
      return initialState;

    case REALM_INIT:
      return action.data.presences || initialState;

    case PRESENCE_RESPONSE:
      return {
        ...state,
        ...action.presence,
      };

    case EVENT_PRESENCE:
      return {
        ...state,
        [action.email]: {
          ...state[action.email],
          ...action.presence,
          aggregated: getAggregatedPresence({ ...state[action.email], ...action.presence }),
        },
      };

    default:
      return state;
  }
};
