import { fromJS } from 'immutable';
import { REHYDRATE } from 'redux-persist/constants';

import {
  LOGIN_PENDING,
  LOGIN_SUCCEEDED,
  LOGIN_FAILED,
  LOGOUT,
  ACCOUNT_ADD_PENDING,
  ACCOUNT_ADD_SUCCEEDED,
  ACCOUNT_ADD_FAILED,
} from './userActions';

import {
  APP_ACTIVITY,
} from './appActions';

const initialState = fromJS({
  lastActivityTime: new Date(),
  isHydrated: false,
  isLoggedIn: false,
  pendingServerResponse: false,
});

export default (state = initialState, action) => {
  switch (action.type) {
    case LOGIN_SUCCEEDED:
      return state.merge({
        isLoggedIn: true,
        pendingServerResponse: false,
      });
    case LOGIN_PENDING:
    case ACCOUNT_ADD_PENDING:
      return state.merge({
        pendingServerResponse: true,
      });
    case LOGIN_FAILED:
    case ACCOUNT_ADD_FAILED:
    case ACCOUNT_ADD_SUCCEEDED:
      return state.merge({
        pendingServerResponse: false,
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
