import { fromJS } from 'immutable';
import {
  EVENT_PRESENCE,
} from '../events/eventActions';
import {
  PRESENCE_RESPONSE,
  USER_FILTER_CHANGE,
} from './userListActions';

const initialState = fromJS({
  filter: '',
  users: [
    { status: 'active', name: 'Boris' },
    { status: 'idle', name: 'Tim' },
    { status: 'offline', name: 'Neraj' },
  ],
  presence: {},
});

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case PRESENCE_RESPONSE:
      return state.merge({
        presence: fromJS(action.presence),
      });
    case EVENT_PRESENCE:
      console.log('!!!!!!!!', action.presence);
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
