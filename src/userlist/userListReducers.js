import { fromJS } from 'immutable';
import { UserStatus } from '../api/apiClient';
import {
  EVENT_PRESENCE,
} from '../events/eventActions';
import {
  GET_USER_RESPONSE,
  PRESENCE_RESPONSE,
  USER_FILTER_CHANGE,
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

type User = {
  avatarUrl: string,
  botOwner: ?string,
  email: string,
  fullName: string,
  isActive: boolean,
  isAdmin: boolean,
  isBot: boolean,
  presence: PresenceMap,
}

const initialState = fromJS({
  filter: '',
  users: [],
});

const activityFromPresence = (presence: PresenceMap): UserStatus =>
  'active';

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case PRESENCE_RESPONSE: {
      let newState = state;
      Object.keys(action.presence).forEach(x => {
        const status = activityFromPresence(action.presence[x]);
        const user = state.find(u => u.email === x);
        newState = state.setIn([user, { status }]);
      });
      return newState;
    }
    case GET_USER_RESPONSE:
      return state.merge({
        users: fromJS(action.users.map(x => ({
          email: x.email,
          fullName: x.full_name,
          avatarUrl: x.avatar_url,
          isActive: x.is_active,
          isAdmin: x.is_admin,
          isBot: x.is_bot,
        }))),
      });
    case EVENT_PRESENCE:
      // TODO console.log('!!!!!!!!', action.presence);
      return state;
    case USER_FILTER_CHANGE:
      return state.merge({
        filter: action.filter,
      });
    default:
      return state;
  }
};

export default reducer;
