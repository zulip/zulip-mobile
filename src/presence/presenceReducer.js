/* @flow strict-local */
import type { PresenceState, PerAccountApplicableAction } from '../types';
import {
  LOGOUT,
  LOGIN_SUCCESS,
  ACCOUNT_SWITCH,
  EVENT_PRESENCE,
  PRESENCE_RESPONSE,
  REGISTER_COMPLETE,
} from '../actionConstants';
import { NULL_OBJECT } from '../nullObjects';
import { getAggregatedPresence } from '../utils/presence';
import { objectEntries } from '../flowPonyfill';

const initialState: PresenceState = NULL_OBJECT;

export default (
  state: PresenceState = initialState, // eslint-disable-line default-param-last
  action: PerAccountApplicableAction,
): PresenceState => {
  switch (action.type) {
    case LOGOUT:
    case LOGIN_SUCCESS:
    case ACCOUNT_SWITCH:
      return initialState;

    case REGISTER_COMPLETE:
      return (
        action.data.presences
        // TODO(#5102): Delete fallback once we enforce any threshold for
        //   ancient servers we refuse to connect to. It was added in
        //   #2878 (2018-11-16), but it wasn't clear even then, it seems,
        //   whether any servers actually omit the data. The API doc
        //   doesn't mention any servers that omit it, and our Flow types
        //   mark it required.
        || initialState
      );

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
        // Flow bug (unresolved):
        // https://github.com/facebook/flow/issues/8276
        // $FlowIssue[cannot-spread-indexer] #8276
        [action.email]: {
          ...state[action.email],
          ...action.presence,
          // Flow bug (unresolved):
          // https://github.com/facebook/flow/issues/8276
          // $FlowIssue[cannot-spread-indexer] #8276
          aggregated: getAggregatedPresence({
            ...state[action.email],
            ...action.presence,
          }),
        },
      };
    }
    default:
      return state;
  }
};
