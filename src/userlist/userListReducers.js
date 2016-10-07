import { fromJS } from 'immutable';
import { UserStatus } from '../api/apiClient';
import {
  EVENT_PRESENCE,
} from '../events/eventActions';
import {
  GET_USER_RESPONSE,
  PRESENCE_RESPONSE,
} from './userListActions';

type Presence = {
  client: string,
  pushable: boolean,
  status: UserStatus,
  timestamp: number,
}

type PresenceMap = {
  [key: string]: Presence,
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

const initialState = fromJS([]);

export default (state = initialState, action) => {
  switch (action.type) {
    case PRESENCE_RESPONSE: {
      return Object.keys(action.presence).reduce((currentState, email) => {
        const userIndex = state.findIndex(u => u.get('email') === email);
        if (userIndex === -1) return currentState;

        const p = action.presence[email];
        const status = activityFromPresence(p);
        const timestamp = timestampFromPresence(p);
        return currentState.setIn([userIndex, 'status'], status).setIn([userIndex, 'timestamp'], timestamp);
      }, state);
    }
    case GET_USER_RESPONSE: {
      const users = action.users.map(x => ({
        email: x.email,
        fullName: x.full_name,
        avatarUrl: x.avatar_url,
        isActive: x.is_active,
        isAdmin: x.is_admin,
        isBot: x.is_bot,
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
