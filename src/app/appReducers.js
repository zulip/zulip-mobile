/* @flow */
import { REHYDRATE } from 'redux-persist/constants';

import { AppState, Action } from '../types';
import {
  APP_REFRESH,
  LOGIN_SUCCESS,
  APP_ONLINE,
  APP_ACTIVITY,
  ACCOUNT_SWITCH,
  REALM_INIT,
  INIT_SAFE_AREA_INSETS,
  INITIAL_FETCH_COMPLETE,
  APP_ORIENTATION,
  APP_STATE,
  TOGGLE_COMPOSE_TOOLS,
  CANCEL_EDIT_MESSAGE,
  START_EDIT_MESSAGE,
  START_OUTBOX_SENDING,
  FINISHED_OUTBOX_SENDING,
  DEBUG_FLAG_TOGGLE,
} from '../actionConstants';
import { getAuth } from '../selectors';

const initialState: AppState = {
  composeTools: false,
  eventQueueId: null,
  editMessage: null,
  isOnline: true,
  isActive: true,
  isHydrated: false,
  lastActivityTime: new Date(),
  needsInitialFetch: false,
  orientation: 'PORTRAIT',
  outboxSending: false,
  safeAreaInsets: {
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
  },
  debug: {
    htmlMessages: false,
    unreadMessages: false,
    splitMessageText: false,
  },
};

export default (state: AppState = initialState, action: Action) => {
  switch (action.type) {
    case APP_REFRESH:
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
        isHydrated: true,
        needsInitialFetch: !!getAuth(action.payload).apiKey,
      };

    case REALM_INIT:
      return {
        ...state,
        eventQueueId: action.data.queue_id,
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

    case INIT_SAFE_AREA_INSETS:
      return {
        ...state,
        safeAreaInsets: action.safeAreaInsets,
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
          topic: action.topic,
        },
      };

    case START_OUTBOX_SENDING:
      return { ...state, outboxSending: true };

    case FINISHED_OUTBOX_SENDING:
      return { ...state, outboxSending: false };

    case DEBUG_FLAG_TOGGLE:
      return {
        ...state,
        debug: {
          ...state.debug,
          [action.key]: action.value,
        },
      };

    default:
      return state;
  }
};
