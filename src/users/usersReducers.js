import { UserStatus } from '../api';
import { Presence } from '../types';
import {
  LOGOUT,
  LOGIN_SUCCESS,
  ACCOUNT_SWITCH,
  EVENT_PRESENCE,
  INIT_USERS,
  EVENT_USER_ADD,
  EVENT_USER_REMOVE,
  EVENT_USER_UPDATE,
  PRESENCE_RESPONSE,
} from '../constants';

const priorityToState = {
  0: 'offline',
  1: 'idle',
  2: 'active',
};

const stateToPriority = {
  offline: 0,
  idle: 1,
  active: 2,
};

const mapApiToStateUser = (user) => ({
  id: user.user_id,
  email: user.email,
  fullName: user.full_name,
  avatarUrl: user.avatar_url,
  isActive: user.is_active,
  isAdmin: user.is_admin,
  isBot: user.is_bot,
});

export const activityFromPresence = (presence: Presence): UserStatus =>
  priorityToState[Math.max(...Object.values(presence).map(x => stateToPriority[x.status]))];

export const timestampFromPresence = (presence: Presence): UserStatus =>
  Math.max(...Object.values(presence).map(x => x.timestamp));

export const activityFromTimestamp = (activity: string, timestamp: number) =>
  ((new Date() / 1000) - timestamp > 60 ? 'offline' : activity);

const initialState = [];

export default (state = initialState, action) => {
  switch (action.type) {
    case LOGOUT:
    case LOGIN_SUCCESS:
    case ACCOUNT_SWITCH:
      return [];
    case PRESENCE_RESPONSE: {
      return Object.keys(action.presence).reduce((currentState, email) => {
        const userIndex = state.findIndex(u => u.email === email);
        if (userIndex === -1) return currentState;

        const presenceEntry = action.presence[email];
        const timestamp = timestampFromPresence(presenceEntry);
        const status = activityFromTimestamp(activityFromPresence(presenceEntry), timestamp);

        currentState[userIndex].status = status; // eslint-disable-line
        currentState[userIndex].timestamp = timestamp; // eslint-disable-line

        return currentState;
      }, state.slice());
    }
    case INIT_USERS: {
      return action.users.map(mapApiToStateUser);
    }
    case EVENT_USER_ADD:
      return [
        ...state,
        mapApiToStateUser(action.person),
      ];
    case EVENT_USER_REMOVE:
      return state; // TODO
    case EVENT_USER_UPDATE:
      return state; // TODO
    case EVENT_PRESENCE:
      return state; // TODO
    default:
      return state;
  }
};
