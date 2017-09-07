/* @flow */
import type { UsersState, Action, Presence } from '../types';
import {
  LOGOUT,
  LOGIN_SUCCESS,
  ACCOUNT_SWITCH,
  EVENT_PRESENCE,
  PRESENCE_RESPONSE,
} from '../actionConstants';
import { NULL_PRESENCE } from '../nullObjects';

export const updateUserWithPresence = (
  user: Object,
  presence: Presence,
  serverTimestamp: number,
) => {
  if (presence.aggregated !== undefined) {
    return {
      ...user,
      status: presence.aggregated.status,
      timestamp: presence.aggregated.timestamp,
      age: serverTimestamp - presence.aggregated.timestamp,
      client: presence.aggregated.client,
    };
  }
  // find latest presence from all the devices available
  return Object.keys(presence).reduce(
    (latestPresence, key) => {
      const newPresence = presence[key];
      const timestamp = newPresence.timestamp;
      if (timestamp > latestPresence.timestamp) {
        latestPresence = { ...newPresence, age: serverTimestamp - timestamp, email: user.email };
      }
      return latestPresence;
    },
    { ...NULL_PRESENCE, email: user.email },
  );
};

const initialState: UsersState = [];

export default (state: UsersState = initialState, action: Action): UsersState => {
  switch (action.type) {
    case LOGOUT:
    case LOGIN_SUCCESS:
    case ACCOUNT_SWITCH:
      return initialState;

    case PRESENCE_RESPONSE: {
      const newState = [...state];
      return Object.keys(action.presence).reduce((currentState, email) => {
        const userIndex = state.findIndex(u => u.email === email);

        if (userIndex === -1) {
          let user = { email };
          user = updateUserWithPresence(user, action.presence[email], action.serverTimestamp);
          return [...currentState, user];
        }

        currentState[userIndex] = updateUserWithPresence(
          // eslint-disable-line
          currentState[userIndex],
          action.presence[email],
          action.serverTimestamp,
        );
        return currentState;
      }, newState);
    }

    case EVENT_PRESENCE: {
      const userIndex = state.findIndex(u => u.email === action.email);
      let user;
      let newState = [...state];
      if (userIndex === -1) {
        user = { email: action.email };
        user = updateUserWithPresence(user, action.presence, action.server_timestamp);
        newState = [...state, user];
      } else {
        user = updateUserWithPresence(state[userIndex], action.presence, action.server_timestamp);
        newState[userIndex] = user;
      }
      return newState;
    }

    default:
      return state;
  }
};
