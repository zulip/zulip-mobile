import { fromJS } from 'immutable';
import { REHYDRATE } from 'redux-persist/constants';

import {
  LOGIN_SUCCEEDED,
  LOGOUT,
} from './accountActions';

import {
  APP_ACTIVITY,
} from './appActions';

const initialState = fromJS({
  lastActivityTime: new Date(),
  isHydrated: false,
  isLoggedIn: false,
});

export default (state = initialState, action) => {
  switch (action.type) {
    case LOGIN_SUCCEEDED:
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
    default:
      return state;
  }
};
