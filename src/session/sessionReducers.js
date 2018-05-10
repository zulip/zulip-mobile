/* @flow */
import { REHYDRATE } from 'redux-persist/constants';

import type {
  SessionState,
  SessionAction,
  RehydrateAction,
  AccountSwitchAction,
  AppStateAction,
  AppOnlineAction,
  AppRefreshAction,
  InitialFetchCompleteAction,
  InitSafeAreaInsetsAction,
  AppOrientationAction,
  StartEditMessageAction,
  CancelEditMessageAction,
  LoginSuccessAction,
  RealmInitAction,
  DebugFlagToggleAction,
  ToggleOutboxSendingAction,
} from '../types';
import {
  APP_REFRESH,
  LOGIN_SUCCESS,
  APP_ONLINE,
  ACCOUNT_SWITCH,
  REALM_INIT,
  INIT_SAFE_AREA_INSETS,
  INITIAL_FETCH_COMPLETE,
  APP_ORIENTATION,
  APP_STATE,
  CANCEL_EDIT_MESSAGE,
  START_EDIT_MESSAGE,
  TOGGLE_OUTBOX_SENDING,
  DEBUG_FLAG_TOGGLE,
} from '../actionConstants';
import { getAuth } from '../selectors';

const initialState: SessionState = {
  eventQueueId: -1,
  editMessage: null,
  isOnline: true,
  isActive: true,
  isHydrated: false,
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
    highlightUnreadMessages: true,
    doNotMarkMessagesAsRead: true,
  },
};

const appRefresh = (
  state: SessionState,
  action: AppRefreshAction | AccountSwitchAction,
): SessionState => ({
  ...state,
  needsInitialFetch: true,
});

const loginSuccess = (state: SessionState, action: LoginSuccessAction): SessionState => ({
  ...state,
  needsInitialFetch: !!action.apiKey,
});

const rehydrate = (state: SessionState, action: RehydrateAction): SessionState => ({
  ...state,
  isHydrated: true,
  needsInitialFetch: !!getAuth(action.payload).apiKey,
});

const realmInit = (state: SessionState, action: RealmInitAction): SessionState => ({
  ...state,
  eventQueueId: action.data.queue_id,
});

const appOnline = (state: SessionState, action: AppOnlineAction): SessionState => ({
  ...state,
  isOnline: action.isOnline,
});

const appState = (state: SessionState, action: AppStateAction): SessionState => ({
  ...state,
  isActive: action.isActive,
});

const initialFetchComplete = (
  state: SessionState,
  action: InitialFetchCompleteAction,
): SessionState => ({
  ...state,
  needsInitialFetch: false,
});

const initSafeAreaInsets = (
  state: SessionState,
  action: InitSafeAreaInsetsAction,
): SessionState => ({
  ...state,
  safeAreaInsets: action.safeAreaInsets,
});

const appOrientation = (state: SessionState, action: AppOrientationAction): SessionState => ({
  ...state,
  orientation: action.orientation,
});

const cancelEditMessage = (state: SessionState, action: CancelEditMessageAction): SessionState => ({
  ...state,
  editMessage: null,
});

const startEditMessage = (state: SessionState, action: StartEditMessageAction): SessionState => ({
  ...state,
  editMessage: {
    id: action.messageId,
    content: action.message,
    topic: action.topic,
  },
});

const toggleOutboxSending = (
  state: SessionState,
  action: ToggleOutboxSendingAction,
): SessionState => ({ ...state, outboxSending: action.sending });

const debugFlagToggle = (state: SessionState, action: DebugFlagToggleAction): SessionState => ({
  ...state,
  debug: {
    ...state.debug,
    [action.key]: action.value,
  },
});

export default (state: SessionState = initialState, action: SessionAction): SessionState => {
  switch (action.type) {
    case APP_REFRESH:
    case ACCOUNT_SWITCH:
      return appRefresh(state, action);

    case LOGIN_SUCCESS:
      return loginSuccess(state, action);

    case REHYDRATE:
      return rehydrate(state, action);

    case REALM_INIT:
      return realmInit(state, action);

    case APP_ONLINE:
      return appOnline(state, action);

    case APP_STATE:
      return appState(state, action);

    case INITIAL_FETCH_COMPLETE:
      return initialFetchComplete(state, action);

    case INIT_SAFE_AREA_INSETS:
      return initSafeAreaInsets(state, action);

    case APP_ORIENTATION:
      return appOrientation(state, action);

    case CANCEL_EDIT_MESSAGE:
      return cancelEditMessage(state, action);

    case START_EDIT_MESSAGE:
      return startEditMessage(state, action);

    case TOGGLE_OUTBOX_SENDING:
      return toggleOutboxSending(state, action);

    case DEBUG_FLAG_TOGGLE:
      return debugFlagToggle(state, action);

    default:
      return state;
  }
};
