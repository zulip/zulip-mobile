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

const initialState = fromJS([]);

const activityFromPresence = (presence: PresenceMap): UserStatus =>
  'active';

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case PRESENCE_RESPONSE: {
      let newState = state;
      Object.keys(action.presence).forEach(x => {
        const status = activityFromPresence(action.presence[x]);
        const user = state.find(u => u.email === x);
        newState = state.set({ status });
      });
      return newState;
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

export default reducer;
