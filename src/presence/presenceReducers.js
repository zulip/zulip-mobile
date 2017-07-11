/* @flow */
import type { UsersState, Action, ClientPresence, Presence, UserStatus } from '../types';
import {
  LOGOUT,
  LOGIN_SUCCESS,
  ACCOUNT_SWITCH,
  EVENT_PRESENCE,
  PRESENCE_RESPONSE,
} from '../actionConstants';
import { NULL_USER_INDEX } from '../nullObjects';

const priorityToState = [
  'offline',
  'idle',
  'active',
];

const stateToPriority = {
  offline: 0,
  idle: 1,
  active: 2,
};

export const activityFromPresence = (presence: ClientPresence): UserStatus =>
  priorityToState[
    Math.max(...Object.values(presence).map((x: Presence) => stateToPriority[x.status]))
  ];

export const timestampFromPresence = (presence: ClientPresence): UserStatus =>
  Math.max(...Object.values(presence).map((x: Presence) => x.timestamp));

export const activityFromTimestamp = (activity: string, timestamp: number) =>
  ((new Date() / 1000) - timestamp > 60 ? 'offline' : activity);

const updateUserWithPresence = (user: Object, presence: Presence) => {
  const timestamp = timestampFromPresence(presence);

  return {
    ...user,
    status: activityFromTimestamp(activityFromPresence(presence), timestamp),
    timestamp,
  };
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
        if (userIndex === NULL_USER_INDEX) {
          let user = { email };
          user = updateUserWithPresence(user, action.presence[email]);
          return [...currentState, user];
        } else {
          currentState[userIndex] = // eslint-disable-line
            updateUserWithPresence(currentState[userIndex], action.presence[email]);
          return currentState;
        }
      }, newState);
    }
    case EVENT_PRESENCE: {
      const userIndex = state.findIndex(u => u.email === action.email);
      let user;
      let newState = [...state];
      if (userIndex === NULL_USER_INDEX) {
        user = { email: action.email };
        user = updateUserWithPresence(user, action.presence);
        newState = [...state, user];
      } else {
        user = updateUserWithPresence(state[userIndex], action.presence);
        newState[userIndex] = user;
      }
      return newState;
    }
    default:
      return state;
  }
};
