import { fromJS } from 'immutable';
import { UserStatus } from '../api';
import {
  EVENT_PRESENCE,
  GET_USER_RESPONSE,
  PRESENCE_RESPONSE,
} from '../constants';

type Presence = {
  client: string,
  pushable: boolean,
  status: UserStatus,
  timestamp: number,
}

// type User = {
//   avatarUrl: string,
//   botOwner: ?string,
//   email: string,
//   fullName: string,
//   isActive: boolean,
//   isAdmin: boolean,
//   isBot: boolean,
//   presence: PresenceMap,
// }

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

export const activityFromPresence = (presence: Presence): UserStatus =>
  priorityToState[Math.max(...Object.values(presence).map(x => stateToPriority[x.status]))];

export const timestampFromPresence = (presence: Presence): UserStatus =>
  Math.max(...Object.values(presence).map(x => x.timestamp));

export const activityFromTimestamp = (activity: string, timestamp: number) =>
  ((new Date() / 1000) - timestamp > 60 ? 'offline' : activity);

const initialState = fromJS([]);

export default (state = initialState, action) => {
  switch (action.type) {
    case PRESENCE_RESPONSE: {
      return Object.keys(action.presence).reduce((currentState, email) => {
        const userIndex = state.findIndex(u => u.get('email') === email);
        if (userIndex === -1) return currentState;

        const presenceEntry = action.presence[email];
        const timestamp = timestampFromPresence(presenceEntry);
        const status = activityFromTimestamp(activityFromPresence(presenceEntry), timestamp);
        return currentState.setIn([userIndex, 'status'], status).setIn([userIndex, 'timestamp'], timestamp);
      }, state);
    }
    case GET_USER_RESPONSE: {
      const users = action.users.map(user => ({
        email: user.email,
        fullName: user.full_name,
        avatarUrl: user.avatar_url,
        isActive: user.is_active,
        isAdmin: user.is_admin,
        isBot: user.is_bot,
      }));
      return state.merge(fromJS(users));
    }
    case EVENT_PRESENCE:
      // TODO
      return state;
    default:
      return state;
  }
};
