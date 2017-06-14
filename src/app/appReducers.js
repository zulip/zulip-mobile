/* @flow */
import { REHYDRATE } from 'redux-persist/constants';

import { StateType, Action } from '../types';
import {
  LOGIN_SUCCESS,
  LOGIN_FAILURE,
  LOGOUT,
  APP_ONLINE,
  APP_ACTIVITY,
  ACCOUNT_SWITCH,
  INITIAL_FETCH_COMPLETE,
  APP_ORIENTATION,
  APP_STATE,
  SAVE_TOKEN_GCM,
  DELETE_TOKEN_GCM,
} from '../actionConstants';

import { getAuth } from '../account/accountSelectors';

const initialState = {
  lastActivityTime: new Date(),
  isHydrated: false,
  isOnline: true,
  isActive: true,
  needsInitialFetch: false,
  gcmToken: ''
};

export default (state: StateType = initialState, action:Action) => {
  switch (action.type) {
    case ACCOUNT_SWITCH:
      return {
        ...state,
        lastActivityTime: new Date(),
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
    case APP_STATE:
      return {
        ...state,
        isActive: action.isActive,
      };
    case INITIAL_FETCH_COMPLETE:
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
