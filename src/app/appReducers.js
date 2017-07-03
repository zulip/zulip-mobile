/* @flow */
import { REHYDRATE } from 'redux-persist/constants';
import { AppState, Action } from '../types';
import {
  LOGIN_SUCCESS,
  LOGOUT,
  APP_ONLINE,
  APP_ACTIVITY,
  ACCOUNT_SWITCH,
  EVENT_REGISTERED,
  INITIAL_FETCH_COMPLETE,
  APP_ORIENTATION,
  APP_STATE,
} from '../actionConstants';

import { getAuth } from '../account/accountSelectors';

const initialState: AppState = {
  lastActivityTime: new Date(),
  isHydrated: false,
  isOnline: true,
  isActive: true,
  needsInitialFetch: false,
  pushToken: '',
  eventQueueId: null,
};

export default (state: AppState = initialState, action: Action) => {
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
    case EVENT_REGISTERED:
      return {
        ...state,
        eventQueueId: action.queueId,
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
