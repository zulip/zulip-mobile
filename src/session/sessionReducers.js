/* @flow strict-local */
import type {
  Debug,
  Dimensions,
  EditMessage,
  Narrow,
  Orientation,
  SessionAction,
  RehydrateAction,
  AccountSwitchAction,
  AppStateAction,
  AppOnlineAction,
  DeadQueueAction,
  DoNarrowAction,
  GotPushTokenAction,
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
  REHYDRATE,
  DEAD_QUEUE,
  DO_NARROW,
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
  GOT_PUSH_TOKEN,
} from '../actionConstants';
import { hasAuth } from '../account/accountsSelectors';

/**
 * Miscellaneous non-persistent state about this run of the app.
 *
 * @prop lastNarrow - the last narrow we navigated to.  If the user is
 *   currently in a chat screen this will also be the "current" narrow,
 *   but they may also be on an associated info screen or have navigated
 *   away entirely.
 */
export type SessionState = {|
  eventQueueId: number,
  editMessage: ?EditMessage,
  isOnline: boolean,
  isActive: boolean,
  isHydrated: boolean,
  lastNarrow: ?Narrow,
  needsInitialFetch: boolean,
  orientation: Orientation,
  outboxSending: boolean,

  /**
   * Our actual device token, as most recently learned from the system.
   *
   * With GCM this is the "registration token"; with APNs the "device token".
   *
   * This is `null` before we've gotten a token.
   *
   * See upstream docs:
   *   https://developers.google.com/cloud-messaging/android/client
   *   https://developer.apple.com/documentation/usernotifications/registering_your_app_with_apns
   */
  pushToken: string | null,

  /** For background, google [ios safe area]. */
  safeAreaInsets: Dimensions,

  debug: Debug,
|};

const initialState: SessionState = {
  eventQueueId: -1,
  editMessage: null,
  isOnline: true,
  isActive: true,
  isHydrated: false,
  lastNarrow: null,
  needsInitialFetch: false,
  orientation: 'PORTRAIT',
  outboxSending: false,
  pushToken: null,
  safeAreaInsets: {
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
  },
  debug: {
    highlightUnreadMessages: false,
    doNotMarkMessagesAsRead: false,
  },
};

const loginSuccess = (
  state: SessionState,
  action: DeadQueueAction | LoginSuccessAction | AccountSwitchAction,
): SessionState => ({
  ...state,
  needsInitialFetch: true,
});

const rehydrate = (state: SessionState, action: RehydrateAction): SessionState => {
  const { payload } = action;
  const haveApiKey = !!(payload && payload.accounts && hasAuth(payload));
  return {
    ...state,
    isHydrated: true,
    // On rehydration, do an initial fetch if we have access to an account
    // (indicated by the presence of an api key). Otherwise, the initial fetch
    // will be initiated on loginSuccess.
    needsInitialFetch: haveApiKey,
  };
};

const realmInit = (state: SessionState, action: RealmInitAction): SessionState => ({
  ...state,
  eventQueueId: action.data.queue_id,
});

const doNarrow = (state: SessionState, action: DoNarrowAction): SessionState => ({
  ...state,
  lastNarrow: action.narrow,
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

const gotPushToken = (state: SessionState, action: GotPushTokenAction): SessionState => ({
  ...state,
  pushToken: action.pushToken,
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
    case DEAD_QUEUE:
    case ACCOUNT_SWITCH:
    case LOGIN_SUCCESS:
      return loginSuccess(state, action);

    case REHYDRATE:
      return rehydrate(state, action);

    case REALM_INIT:
      return realmInit(state, action);

    case DO_NARROW:
      return doNarrow(state, action);

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

    case GOT_PUSH_TOKEN:
      return gotPushToken(state, action);

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
