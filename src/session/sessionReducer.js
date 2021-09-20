/* @flow strict-local */
import type { GlobalState, Debug, Orientation, Action } from '../types';
import {
  REHYDRATE,
  DEAD_QUEUE,
  LOGIN_SUCCESS,
  APP_ONLINE,
  ACCOUNT_SWITCH,
  REALM_INIT,
  INITIAL_FETCH_COMPLETE,
  INITIAL_FETCH_ABORT,
  INITIAL_FETCH_START,
  APP_ORIENTATION,
  TOGGLE_OUTBOX_SENDING,
  DEBUG_FLAG_TOGGLE,
  GOT_PUSH_TOKEN,
  LOGOUT,
  DISMISS_SERVER_COMPAT_NOTICE,
} from '../actionConstants';
import { getHasAuth } from '../account/accountsSelectors';

/**
 * Miscellaneous non-persistent state specific to a particular account.
 *
 * See {@link SessionState} for discussion of what "non-persistent" means.
 */
export type PerAccountSessionState = $ReadOnly<{
  eventQueueId: number,

  /**
   * Whether the /register request is in progress.
   *
   * This happens on startup, or on re-init following a dead event
   * queue after 10 minutes of inactivity.
   */
  loading: boolean,

  needsInitialFetch: boolean,

  outboxSending: boolean,

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

  ...
}>;

/**
 * Miscellaneous non-persistent state about this run of the app.
 *
 * These state items are stored in `session.state`, and 'session' is
 * in `discardKeys` in src/boot/store.js. That means these values
 * won't be persisted between sessions; on startup, they'll all be
 * initialized to their default values.
 */
export type SessionState = $ReadOnly<{|
  ...$Exact<PerAccountSessionState>,

  // The properties below are data about the device and the app as a whole,
  // independent of any particular Zulip server or account.
  // For per-account data, see PerAccountSessionState.

  // `null` if we don't know. See the place where we set this, for what that
  // means.
  isOnline: boolean | null,

  isHydrated: boolean,

  orientation: Orientation,

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
|}>;

// As part of letting GlobalState freely convert to PerAccountState,
// we'll want the same for SessionState.  (This is also why
// PerAccountSessionState is inexact.)
(s: SessionState): PerAccountSessionState => s; // eslint-disable-line no-unused-expressions

const initialState: SessionState = {
  eventQueueId: -1,

  // This will be `null` on startup, while we wait to hear `true` or `false`
  // from the native module over the RN bridge; so, have it start as `null`.
  isOnline: null,

  isHydrated: false,
  loading: false,
  needsInitialFetch: false,
  orientation: 'PORTRAIT',
  outboxSending: false,
  pushToken: null,
  debug: Object.freeze({}),
  hasDismissedServerCompatNotice: false,
};

const rehydrate = (state, action) => {
  const { payload } = action;

  /* $FlowIgnore[incompatible-cast]: The actual type allows any property to
       be null; narrow that to just the one that `getHasAuth` will care
       about.  (What we really want here is what the value of `getHasAuth`
       will be after the rehydrate is complete.  So even if some other
       property is null in the payload, we still do want to ask `getHasAuth`
       what it thinks.) */
  const payloadForGetHasAuth = (payload: GlobalState | { accounts: null, ... } | void);
  const haveApiKey = !!(
    payloadForGetHasAuth
    && payloadForGetHasAuth.accounts
    && getHasAuth(payloadForGetHasAuth)
  );

  return {
    ...state,
    isHydrated: true,
    // On rehydration, do an initial fetch if we have access to an account
    // (indicated by the presence of an api key). Otherwise, the initial fetch
    // will be initiated on loginSuccess.
    // NB `getInitialRouteInfo` depends intimately on this behavior.
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

    case INITIAL_FETCH_ABORT:
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
