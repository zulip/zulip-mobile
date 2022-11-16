/* @flow strict-local */
import { addBreadcrumb } from '@sentry/react-native';
// $FlowFixMe[untyped-import]
import isEqual from 'lodash.isequal';

import * as NavigationService from '../nav/NavigationService';
import { resetToAccountPicker } from '../nav/navActions';
import { ensureUnreachable } from '../generics';
import type { InitialData } from '../api/initialDataTypes';
import type { GeneralEvent, ThunkAction, PerAccountAction } from '../types';
import type { RegisterAbortReason } from '../actionTypes';
import * as api from '../api';
import { REGISTER_START, REGISTER_ABORT, REGISTER_COMPLETE, DEAD_QUEUE } from '../actionConstants';
import { logout } from '../account/logoutActions';
import eventToAction from './eventToAction';
import doEventActionSideEffects from './doEventActionSideEffects';
import { getAuth, tryGetAuth, getIdentity } from '../selectors';
import { getHaveServerData } from '../haveServerDataSelectors';
import { getOwnUserRole, roleIsAtLeast } from '../permissionSelectors';
import { Role } from '../api/permissionsTypes';
import { identityOfAuth } from '../account/accountMisc';
import { BackoffMachine, TimeoutError } from '../utils/async';
import { ApiError, RequestError, Server5xxError, NetworkError } from '../api/apiErrors';
import * as logging from '../utils/logging';
import { showErrorAlert } from '../utils/info';
import { ZulipVersion } from '../utils/zulipVersion';
import { tryFetch, fetchPrivateMessages } from '../message/fetchActions';
import { MIN_RECENTPMS_SERVER_VERSION } from '../pm-conversations/pmConversationsModel';
import { sendOutbox } from '../outbox/outboxActions';
import { initNotifications } from '../notification/notifTokens';
import { kNextMinSupportedVersion } from '../common/ServerCompatBanner';
import { maybeRefreshServerEmojiData } from '../emoji/data';

const registerStart = (): PerAccountAction => ({
  type: REGISTER_START,
});

const registerAbortPlain = (reason: RegisterAbortReason): PerAccountAction => ({
  type: REGISTER_ABORT,
  reason,
});

const registerAbort =
  (reason: RegisterAbortReason): ThunkAction<Promise<void>> =>
  async (dispatch, getState) => {
    dispatch(registerAbortPlain(reason));
    if (getHaveServerData(getState()) && reason !== 'unexpected') {
      // Try again, forever if necessary; the user has an interactable UI and
      // can look at stale data while waiting.
      //
      // Do so by lying that the server has told us our queue is invalid and
      // we need a new one.
      //
      // TODO: Stop lying. ;)
      // TODO: Instead, let the retry be on-demand, with a banner.
      dispatch(deadQueue()); // eslint-disable-line no-use-before-define
    } else {
      // Tell the user we've given up and let them try the same account or a
      // different account from the account picker.
      showErrorAlert(
        // TODO: Set up these user-facing strings for translation once
        // `initialFetchAbort`'s callers all have access to a `GetText`
        // function. One place we dispatch the register is in StoreProvider,
        // which isn't a descendant of `TranslationProvider`.
        'Connection failed',
        (() => {
          const realmStr = getIdentity(getState()).realm.toString();
          switch (reason) {
            case 'server':
              return roleIsAtLeast(getOwnUserRole(getState()), Role.Admin)
                ? `Could not connect to ${realmStr} because the server encountered an error. Please check the server logs.`
                : `Could not connect to ${realmStr} because the server encountered an error. Please ask an admin to check the server logs.`;
            case 'network':
              return `The network request to ${realmStr} failed.`;
            case 'timeout':
              return `Gave up trying to connect to ${realmStr} after waiting too long.`;
            case 'unexpected':
              return `Unexpected error while trying to connect to ${realmStr}.`;
            default:
              ensureUnreachable(reason);
              return '';
          }
        })(),
      );
      NavigationService.dispatch(resetToAccountPicker());
    }
  };

const registerComplete = (data: InitialData): PerAccountAction => ({
  type: REGISTER_COMPLETE,
  data,
});

/**
 * Connect to the Zulip event system for real-time updates.
 *
 * For background on the Zulip event system and how we use it, see docs from
 * the client-side perspective:
 *   https://github.com/zulip/zulip-mobile/blob/main/docs/architecture/realtime.md
 * and a mainly server-side perspective:
 *   https://zulip.readthedocs.io/en/latest/subsystems/events-system.html
 *
 * First does POST /register, which is sometimes called the "initial fetch".
 * because the response comes with a large payload of current-state data
 * that we fetch as part of initializing the event queue:
 *   https://zulip.readthedocs.io/en/latest/subsystems/events-system.html#the-initial-data-fetch
 *
 * Then immediately starts an async loop to poll for events.
 *
 * We fetch private messages here so that we can show something useful in
 * the PM conversations screen, but we hope to stop doing this soon (see
 * note at `fetchPrivateMessages`). We fetch messages in a few other places:
 * to initially populate a message list (`ChatScreen`), to grab more
 * messages on scrolling to the top or bottom of the message list
 * (`fetchOlder` and `fetchNewer`), and to grab search results
 * (`SearchMessagesScreen`).
 */
export const registerAndStartPolling =
  (): ThunkAction<Promise<void>> => async (dispatch, getState) => {
    const auth = getAuth(getState());

    const haveServerData = getHaveServerData(getState());

    dispatch(registerStart());
    let initData: InitialData;
    try {
      initData = await tryFetch(
        // Currently, no input we're giving `registerForEvents` is
        // conditional on the server version / feature level. If we
        // need to do that, make sure that data is up-to-date -- we've
        // been using this `registerForEvents` call to update the
        // feature level in Redux, which means the value in Redux will
        // be from the *last* time it was run. That could be a long
        // time ago, like from the previous app startup.
        () => api.registerForEvents(auth),
        // We might have (potentially stale) server data already. If
        // we do, we'll be showing some UI that lets the user see that
        // data. If we don't, we'll be showing a full-screen loading
        // indicator that prevents the user from doing anything useful
        // -- if that's the case, don't bother retrying on 5xx errors,
        // to save the user's time and patience. They can retry
        // manually if they want.
        haveServerData,
      );
    } catch (errorIllTyped) {
      const e: mixed = errorIllTyped; // https://github.com/facebook/flow/issues/2470
      if (e instanceof ApiError) {
        // This should only happen when `auth` is no longer valid. No
        // use retrying; just log out.
        dispatch(logout());
      } else if (e instanceof Server5xxError) {
        dispatch(registerAbort('server'));
      } else if (e instanceof NetworkError) {
        dispatch(registerAbort('network'));
      } else if (e instanceof TimeoutError) {
        // We always want to abort if we've kept the user waiting an
        // unreasonably long time.
        dispatch(registerAbort('timeout'));
      } else {
        dispatch(registerAbort('unexpected'));
        // $FlowFixMe[incompatible-cast]: assuming caught exception was Error
        logging.warn((e: Error), {
          message: 'Unexpected error during /register.',
        });
      }
      return;
    }

    const serverVersion = new ZulipVersion(initData.zulip_version);

    // Set Sentry tags for the server version immediately, so they're accurate
    // in case we hit an exception in reducers on `registerComplete` below.
    logging.setTagsFromServerVersion(serverVersion);

    if (!serverVersion.isAtLeast(kNextMinSupportedVersion)) {
      // The server version is either one we already don't support, or one
      // we'll stop supporting the next time we increase our minimum supported
      // version.  Warn so that we have an idea of how widespread this is.
      // (Include the coarse version in the warning message, so that it splits
      // into separate Sentry "issues" by coarse version.  The Sentry events
      // will also have the detailed version, from the call above to
      // `logging.setTagsFromServerVersion`.)
      logging.warn(`Old server version: ${serverVersion.classify().coarse}`);
    }

    dispatch(registerComplete(initData));

    // eslint-disable-next-line no-use-before-define
    dispatch(startEventPolling(initData.queue_id, initData.last_event_id));

    // This is part of "register" in that it fills in some missing /register
    // functionality for older servers; see fetchPrivateMessages for detail.
    if (!serverVersion.isAtLeast(MIN_RECENTPMS_SERVER_VERSION)) {
      dispatch(fetchPrivateMessages());
    }

    // We can think of this as part of "register" because it fetches data
    // that *would've* been in the /register response, except that we pulled
    // it out to its own endpoint as part of a caching strategy, because the
    // data changes infrequently.
    //
    // It's fine not to set the payload in Redux atomically with the
    // "proper" /register data in registerComplete. That's because:
    //   - It's not designed to get updated by events, since the data only
    //     changes on a server restart. So #5434 can't be active; that's
    //     "Handle event-vs-fetch races soundly."
    //   - There aren't any dependencies between the /register payload and
    //     this payload, in either direction. (E.g., key-value lookups.)
    //   - While it's possible for the first refreshServerEmojiData to
    //     arrive very late or not at all, following a registerComplete,
    //     Flow will help us ensure that we fail gracefully with a fallback
    //     during the time that the data is missing. During that time, we'll
    //     act just the same as we do for pre-6.0 servers, which don't offer
    //     the endpoint.
    //
    // TODO(server-6.0): Change or remove "pre-6.0" comment above.
    dispatch(maybeRefreshServerEmojiData(initData.server_emoji_data_url));
  };

/**
 * Handle a single Zulip event from the server.
 *
 * This is part of our use of the Zulip events system; see `registerAndStartPolling`
 * for discussion.
 */
const handleEvent = (event: GeneralEvent, dispatch, getState) => {
  addBreadcrumb({
    category: 'z-event',
    level: 'info',
    data: { type: event.type, ...(event.op !== undefined && { op: event.op }) },
  });

  try {
    const action = eventToAction(getState(), event);
    if (!action) {
      return;
    }

    // These side effects should not be moved to reducers, which
    // are explicitly not the place for side effects (see
    // https://redux.js.org/faq/actions).
    dispatch(doEventActionSideEffects(action));

    // Now dispatch the plain-object action, for our reducers to handle.
    dispatch(action);
  } catch (e) {
    // We had an error processing the event.  Log it and carry on.
    logging.error(e);
  }
};

/**
 * Poll an event queue on the Zulip server for updates, in a loop.
 *
 * This is part of our use of the Zulip events system; see `registerAndStartPolling`
 * for discussion.
 */
export const startEventPolling =
  (queueId: string, eventId: number): ThunkAction<Promise<void>> =>
  async (dispatch, getState) => {
    let lastEventId = eventId;

    const backoffMachine = new BackoffMachine();

    while (true) {
      const auth = tryGetAuth(getState());
      if (!auth) {
        // This account is not logged in.
        break;
      }
      // `auth` represents the active account.  It might be different from
      // the one in the previous loop iteration, if we did a backoff wait.
      // TODO(#5009): Is that really quite OK?

      let events = undefined;
      try {
        const response = await api.pollForEvents(auth, queueId, lastEventId);
        events = response.events;

        if (getState().session.eventQueueId === null) {
          // We don't want to keep polling, e.g., because we've logged out;
          // see `PerAccountSessionState.eventQueueId` for other cases.
          break;
        } else if (!isEqual(getIdentity(getState()), identityOfAuth(auth))) {
          // During the last poll, the active account changed. Stop polling
          // for the previous one.
          // TODO(#5005): Remove this conditional as unreachable, once `auth`
          //   represents the current account (instead of secretly
          //   representing the global "active account" which can change.)
          break;
        } else if (queueId !== getState().session.eventQueueId) {
          // While the most recent poll was happening, another queue was
          // established for this account, and we've started polling on that
          // one. Stop polling on this one.
          //
          // In theory this could happen if you logged out of this account and
          // logged back in again.
          //
          // TODO(#5009): Instead of this conditional, abort the
          //   `api.pollForEvents` immediately when `eventQueueId` becomes
          //   `null`, then break at that time?
          break;
        }
      } catch (errorIllTyped) {
        const e: mixed = errorIllTyped; // https://github.com/facebook/flow/issues/2470
        // We had an error polling the server for events.

        if (e instanceof RequestError && e.httpStatus === 401) {
          // 401 Unauthorized -> our `auth` is invalid.  No use retrying.
          dispatch(logout());
          break;
        }

        // protection from inadvertent DDOS
        await backoffMachine.wait();

        if (e instanceof ApiError && e.code === 'BAD_EVENT_QUEUE_ID') {
          // The event queue is too old or has been garbage collected.
          dispatch(deadQueue()); // eslint-disable-line no-use-before-define
          break;
        }

        continue;
      }

      for (const event of events) {
        handleEvent(event, dispatch, getState);
      }

      lastEventId = Math.max(lastEventId, ...events.map(x => x.id));
    }
  };

const deadQueuePlain = (): PerAccountAction => ({
  type: DEAD_QUEUE,
});

const deadQueue = (): ThunkAction<Promise<void>> => async (dispatch, getState) => {
  dispatch(deadQueuePlain());

  await dispatch(registerAndStartPolling());

  // TODO(#3881): Lots of issues with outbox sending
  dispatch(sendOutbox());

  dispatch(initNotifications());
};
