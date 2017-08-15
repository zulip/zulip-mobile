/* @flow */
import { REHYDRATE } from 'redux-persist/constants';

import { AppState, Action } from '../types';
import {
  LOGIN_SUCCESS,
  APP_ONLINE,
  APP_ACTIVITY,
  ACCOUNT_SWITCH,
  EVENT_REGISTERED,
  INITIAL_FETCH_COMPLETE,
  APP_ORIENTATION,
  APP_STATE,
  TOGGLE_COMPOSE_TOOLS,
  CANCEL_EDIT_MESSAGE,
  START_EDIT_MESSAGE,
  START_OUTBOX_SENDING,
  FINISHED_OUTBOX_SENDING,
} from '../actionConstants';
import { getAuth } from '../selectors';

const initialState: AppState = {
  lastActivityTime: new Date(),
  isHydrated: false,
  isOnline: true,
  isActive: true,
  needsInitialFetch: false,
  composeTools: false,
  pushToken: '',
  eventQueueId: null,
  editMessage: null,
  outboxSending: false,
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
    case TOGGLE_COMPOSE_TOOLS:
      return {
        ...state,
        composeTools: !state.composeTools,
      };
    case CANCEL_EDIT_MESSAGE:
      return {
        ...state,
        editMessage: null,
      };
    case START_EDIT_MESSAGE:
      return {
        ...state,
        editMessage: {
          id: action.messageId,
          content: action.message,
        },
      };
    case START_OUTBOX_SENDING:
      return { ...state, outboxSending: true };
    case FINISHED_OUTBOX_SENDING:
      return { ...state, outboxSending: false };
    default:
      return state;
  }
};
