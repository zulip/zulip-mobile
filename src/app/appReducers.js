import { fromJS } from 'immutable';
import { REHYDRATE } from 'redux-persist/constants';

import {
  LOGIN_SUCCESS,
  LOGIN_FAILURE,
  LOGOUT,
} from '../account/accountActions';

import {
  APP_ONLINE,
  APP_OFFLINE,
  APP_ACTIVITY,
} from './appActions';

const initialState = fromJS({
  lastActivityTime: new Date(),
  isHydrated: false,
  isLoggedIn: false,
  isOnline: true,
});

export default (state = initialState, action) => {
  switch (action.type) {
    case LOGIN_SUCCESS:
      return state.merge({
        isLoggedIn: true,
      });
    case LOGIN_FAILURE:
      return state.merge({
        isLoggedIn: true,
      });
    case REHYDRATE:
      return state.merge({
        isHydrated: true,
        isLoggedIn: !!(action.payload.auth && action.payload.auth.get('apiKey')),
      });
    case LOGOUT:
      return state.merge({
        isLoggedIn: false,
      });
    case APP_ACTIVITY:
      return state.merge({
        lastActivityTime: new Date(),
      });
    case APP_ONLINE:
      return state.merge({
        isOnline: true,
      });
    case APP_OFFLINE:
      return state.merge({
        isOnline: false,
      });
    default:
      return state;
  }
};
