/* @flow */
import type {
  PresenceState,
  PresenceAction,
  EventPresenceAction,
  PresenceResponseAction,
  RealmInitAction,
} from '../types';
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

const realmInit = (state: PresenceState, action: RealmInitAction): PresenceState =>
  action.data.presences;

const presenceResponse = (state: PresenceState, action: PresenceResponseAction): PresenceState => ({
  ...state,
  ...action.presence,
});

const eventPresence = (state: PresenceState, action: EventPresenceAction): PresenceState => ({
  ...state,
  [action.email]: { ...state[action.email], ...action.presence },
});

export default (state: PresenceState = initialState, action: PresenceAction): PresenceState => {
  switch (action.type) {
    case APP_REFRESH:
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
