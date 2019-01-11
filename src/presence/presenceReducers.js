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

const realmInit = (state, action) => action.data.presences || initialState;

const presenceResponse = (state, action) => ({
  ...state,
  ...action.presence,
});

const eventPresence = (state, action) => ({
  ...state,
  [action.email]: {
    ...state[action.email],
    ...action.presence,
    aggregated: getAggregatedPresence({ ...state[action.email], ...action.presence }),
  },
});

export default (state: PresenceState = initialState, action: Action): PresenceState => {
  switch (action.type) {
    case LOGOUT:
    case LOGIN_SUCCESS:
    case ACCOUNT_SWITCH:
      return initialState;

    case REALM_INIT:
      return realmInit(state, action);

    case PRESENCE_RESPONSE:
      return presenceResponse(state, action);

    case EVENT_PRESENCE:
      return eventPresence(state, action);

    default:
      return state;
  }
};
