/* @flow strict-local */
import type { Debug, Orientation, Action } from '../types';
import {
  REHYDRATE,
  DEAD_QUEUE,
  LOGIN_SUCCESS,
  APP_ONLINE,
  ACCOUNT_SWITCH,
  REALM_INIT,
  INITIAL_FETCH_COMPLETE,
  INITIAL_FETCH_START,
  APP_ORIENTATION,
  TOGGLE_OUTBOX_SENDING,
  DEBUG_FLAG_TOGGLE,
  GOT_PUSH_TOKEN,
  LOGOUT,
  DISMISS_SERVER_COMPAT_NOTICE,
} from '../actionConstants';
import { hasAuth } from '../account/accountsSelectors';

/**
 * Miscellaneous non-persistent state about this run of the app.
 *
 * These state items are stored in `session.state`, and 'session' is
 * in `discardKeys` in src/boot/store.js. That means these values
 * won't be persisted between sessions; on startup, they'll all be
 * initialized to their default values.
 */
export type SessionState = {|
  eventQueueId: number,
  isOnline: boolean,
  isHydrated: boolean,

  /**
   * Whether the /register request is in progress.
   *
   * This happens on startup, or on re-init following a dead event
   * queue after 10 minutes of inactivity.
   */
  loading: boolean,

  needsInitialFetch: boolean,
  orientation: Orientation,
  outboxSending: boolean,

  /**
   * Our actual device token, as most recently learned from the system.
   *
   * With FCM/GCM this is the "registration token"; with APNs the "device
   * token".
   *
   * This is `null` before we've gotten a token. On Android, we may also receive
   * an explicit `null` token if the device can't or won't give us a real one.
   *
   * See upstream docs:
   *   https://firebase.google.com/docs/cloud-messaging/android/client#sample-register
   *   https://developers.google.com/cloud-messaging/android/client
   *   https://developer.apple.com/documentation/usernotifications/registering_your_app_with_apns
   *
   * See also discussion at https://stackoverflow.com/q/37517860.
   */
  pushToken: string | null,

  debug: Debug,

  /**
   * Whether `ServerCompatNotice` (which we'll add soon) has been
   *   dismissed this session.
   *
   * We put this in the per-session state deliberately, so that users
   * see the notice on every startup until the server is upgraded.
   * That's a better experience than not being able to load the realm
   * on mobile at all, which is what will happen soon if the user
   * doesn't act on the notice.
   */
  hasDismissedServerCompatNotice: boolean,
|};

const initialState: SessionState = {
  eventQueueId: -1,
  isOnline: true,
  isHydrated: false,
  loading: false,
  needsInitialFetch: false,
  orientation: 'PORTRAIT',
  outboxSending: false,
  pushToken: null,
  debug: {
    doNotMarkMessagesAsRead: false,
  },
  hasDismissedServerCompatNotice: false,
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
    // NB `InitialNavigationDispatcher`'s `doInitialNavigation`
    // depends intimately on this behavior.
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
        needsInitialFetch: false,
        loading: false,
      };

    case ACCOUNT_SWITCH:
      return {
        ...state,
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

    case APP_ONLINE:
      return {
        ...state,
        isOnline: action.isOnline,
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

    case DISMISS_SERVER_COMPAT_NOTICE:
      return {
        ...state,
        hasDismissedServerCompatNotice: true,
      };

    default:
      return state;
  }
};
