import { REHYDRATE } from 'redux-persist/constants';

import {
  LOGIN_SUCCESS,
  LOGIN_FAILURE,
  LOGOUT,
  APP_ONLINE,
  APP_ACTIVITY,
} from '../constants';

const initialState = {
  lastActivityTime: new Date(),
  isHydrated: false,
  isLoggedIn: false,
  isOnline: true,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case LOGIN_SUCCESS:
      return {
        ...state,
        isLoggedIn: true,
      };
    case LOGIN_FAILURE:
      return {
        ...state,
        isLoggedIn: true,
      };
    case REHYDRATE:
      return {
        ...state,
        isHydrated: true,
        isLoggedIn: !!(action.payload.auth && action.payload.auth.apiKey),
      };
    case LOGOUT:
      return {
        ...state,
        isLoggedIn: false,
      };
    case APP_ACTIVITY:
      return {
        ...state,
        lastActivityTime: new Date(),
      };
    case APP_ONLINE:
      return {
        ...state,
        isOnline: action.isOnline,
      };
    default:
      return state;
  }
};
