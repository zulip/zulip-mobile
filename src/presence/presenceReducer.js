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
import objectEntries from '../utils/objectEntries';

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

    case EVENT_PRESENCE: {
      // A presence event should have either "active" or "idle" status
      const isPresenceEventValid = !!objectEntries(action.presence).find(
        ([device, devicePresence]) => ['active', 'idle'].includes(devicePresence.status),
      );
      if (!isPresenceEventValid) {
        return state;
      }

      return {
        ...state,
        [action.email]: {
          ...state[action.email],
          ...action.presence,
          aggregated: getAggregatedPresence({ ...state[action.email], ...action.presence }),
        },
      };
    }
    default:
      return state;
  }
};
