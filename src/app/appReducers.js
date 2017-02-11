import { REHYDRATE } from 'redux-persist/constants';

import {
  LOGIN_SUCCESS,
  LOGIN_FAILURE,
  LOGOUT,
  APP_ONLINE,
  APP_ACTIVITY,
  ACCOUNT_SWITCH,
  INITIAL_DATA_FETCH,
  APP_ORIENTATION,
} from '../constants';

import { getAuth } from '../account/accountSelectors';

const initialState = {
  lastActivityTime: new Date(),
  isHydrated: false,
  isOnline: true,
  needsInitialFetch: false,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case ACCOUNT_SWITCH:
      return {
        ...state,
        needsInitialFetch: true,
      };
    case LOGIN_SUCCESS:
      return {
        ...state,
        needsInitialFetch: !!action.apiKey,
      };
    case LOGIN_FAILURE:
      return {
        ...state,
      };
    case REHYDRATE:
      return {
        ...state,
        needsInitialFetch: !!getAuth(action.payload).apiKey,
        isHydrated: true,
      };
    case LOGOUT:
      return {
        ...state,
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
    case INITIAL_DATA_FETCH:
      return {
        ...state,
        needsInitialFetch: false,
      };
    case APP_ORIENTATION:
      return {
        ...state,
        orientation: action.orientation,
      };
    default:
      return state;
  }
};
