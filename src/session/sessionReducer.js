/* @flow strict-local */
import type { Debug, Dimensions, EditMessage, Narrow, Orientation, Action } from '../types';
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
  INITIAL_FETCH_START,
  APP_ORIENTATION,
  APP_STATE,
  CANCEL_EDIT_MESSAGE,
  START_EDIT_MESSAGE,
  TOGGLE_OUTBOX_SENDING,
  DEBUG_FLAG_TOGGLE,
  GOT_PUSH_TOKEN,
  LOGOUT,
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
  loading: boolean,
  needsInitialFetch: boolean,
  orientation: Orientation,
  outboxSending: boolean,

  /**
   * Our actual device token, as most recently learned from the system.
   *
   * With FCM/GCM this is the "registration token"; with APNs the "device token".
   *
   * This is `null` before we've gotten a token.
   *
   * See upstream docs:
   *   https://firebase.google.com/docs/cloud-messaging/android/client#sample-register
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
  loading: false,
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
    doNotMarkMessagesAsRead: false,
  },
};

const rehydrate = (state, action) => {
  const { payload } = action;
  const haveApiKey = !!(payload && payload.accounts && hasAuth(payload));
  return {
    ...state,
    isHydrated: true,
    // On rehydration, do an initial fetch if we have access to an account
    // (indicated by the presence of an api key). Otherwise, the initial fetch
    // will be initiated on loginSuccess.
    // NB navReducer's rehydrate logic depends intimately on this behavior.
    needsInitialFetch: haveApiKey,
  };
};

export default (state: SessionState = initialState, action: Action): SessionState => {
  switch (action.type) {
    case DEAD_QUEUE:
      return {
        ...state,
        needsInitialFetch: true,
        loading: false,
      };

    case LOGIN_SUCCESS:
      return {
        ...state,
        needsInitialFetch: true,
      };

    case LOGOUT:
      return {
        ...state,
        lastNarrow: null,
        needsInitialFetch: false,
        loading: false,
      };

    case ACCOUNT_SWITCH:
      return {
        ...state,
        lastNarrow: null,
        needsInitialFetch: true,
        loading: false,
      };

    case REHYDRATE:
      return rehydrate(state, action);

    case REALM_INIT:
      return {
        ...state,
        eventQueueId: action.data.queue_id,
      };

    case DO_NARROW:
      return {
        ...state,
        lastNarrow: action.narrow,
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

    case INITIAL_FETCH_START:
      return {
        ...state,
        loading: true,
      };

    case INITIAL_FETCH_COMPLETE:
      return {
        ...state,
        loading: false,
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

    case GOT_PUSH_TOKEN:
      return {
        ...state,
        pushToken: action.pushToken,
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

    case TOGGLE_OUTBOX_SENDING:
      return { ...state, outboxSending: action.sending };

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
