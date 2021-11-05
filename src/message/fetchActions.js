/* @flow strict-local */
import * as logging from '../utils/logging';
import * as NavigationService from '../nav/NavigationService';
import type {
  Narrow,
  PerAccountState,
  Message,
  PerAccountAction,
  ThunkAction,
  UserId,
} from '../types';
import { ensureUnreachable } from '../types';
import type { RegisterAbortReason } from '../actionTypes';
import type { InitialData } from '../api/initialDataTypes';
import * as api from '../api';
import { ApiError, Server5xxError, NetworkError } from '../api/apiErrors';
import { resetToAccountPicker, deadQueue } from '../actions';
import {
  getAuth,
  getSession,
  getFirstMessageId,
  getLastMessageId,
  getCaughtUpForNarrow,
  getFetchingForNarrow,
  getIsAdmin,
  getIdentity,
} from '../selectors';
import config from '../config';
import {
  REGISTER_START,
  REGISTER_ABORT,
  REGISTER_COMPLETE,
  MESSAGE_FETCH_START,
  MESSAGE_FETCH_ERROR,
  MESSAGE_FETCH_COMPLETE,
} from '../actionConstants';
import { FIRST_UNREAD_ANCHOR, LAST_MESSAGE_ANCHOR } from '../anchor';
import { showErrorAlert } from '../utils/info';
import { ALL_PRIVATE_NARROW, apiNarrowOfNarrow, caseNarrow } from '../utils/narrow';
import { BackoffMachine, promiseTimeout, TimeoutError } from '../utils/async';
import { initNotifications } from '../notification/notificationActions';
import { addToOutbox, sendOutbox } from '../outbox/outboxActions';
import { startEventPolling } from '../events/eventActions';
import { logout } from '../account/accountActions';
import { ZulipVersion } from '../utils/zulipVersion';
import { getAllUsersById, getHaveServerData, getOwnUserId } from '../users/userSelectors';
import { MIN_RECENTPMS_SERVER_VERSION } from '../pm-conversations/pmConversationsModel';

const messageFetchStart = (
  narrow: Narrow,
  numBefore: number,
  numAfter: number,
): PerAccountAction => ({
  type: MESSAGE_FETCH_START,
  narrow,
  numBefore,
  numAfter,
});

const messageFetchError = (args: {| narrow: Narrow, error: Error |}): PerAccountAction => {
  const { narrow, error } = args;
  return {
    type: MESSAGE_FETCH_ERROR,
    narrow,
    error,
  };
};

const messageFetchComplete = (args: {|
  messages: Message[],
  narrow: Narrow,
  anchor: number,
  numBefore: number,
  numAfter: number,
  foundNewest: boolean,
  foundOldest: boolean,
  ownUserId: UserId,
|}): PerAccountAction => {
  const {
    messages,
    narrow,
    anchor,
    numBefore,
    numAfter,
    foundNewest,
    foundOldest,
    ownUserId,
  } = args;
  return {
    type: MESSAGE_FETCH_COMPLETE,
    messages,
    narrow,
    anchor,
    numBefore,
    numAfter,
    foundNewest,
    foundOldest,
    ownUserId,
  };
};

/**
 * Get and return messages from the network, keeping Redux up-to-date.
 *
 * The returned Promise resolves with the messages, or rejects on a
 * failed network request or any failure to process data and get it
 * stored in Redux. If it rejects, it tells Redux about it.
 */
export const fetchMessages = (fetchArgs: {|
  narrow: Narrow,
  anchor: number,
  numBefore: number,
  numAfter: number,
|}): ThunkAction<Promise<Message[]>> => async (dispatch, getState) => {
  dispatch(messageFetchStart(fetchArgs.narrow, fetchArgs.numBefore, fetchArgs.numAfter));
  try {
    const { messages, found_newest, found_oldest } =
      // TODO: If `MESSAGE_FETCH_ERROR` isn't the right way to respond
      // to a timeout, maybe make a new action.
      // eslint-disable-next-line no-use-before-define
      await tryFetch(() =>
        api.getMessages(getAuth(getState()), {
          ...fetchArgs,
          narrow: apiNarrowOfNarrow(fetchArgs.narrow, getAllUsersById(getState())),
          useFirstUnread: fetchArgs.anchor === FIRST_UNREAD_ANCHOR, // TODO: don't use this; see #4203
        }),
      );
    dispatch(
      messageFetchComplete({
        ...fetchArgs,
        messages,
        foundNewest: found_newest,
        foundOldest: found_oldest,
        ownUserId: getOwnUserId(getState()),
      }),
    );
    return messages;
  } catch (e) {
    dispatch(
      messageFetchError({
        narrow: fetchArgs.narrow,
        error: e,
      }),
    );
    logging.warn(e, {
      message: 'Message-fetch error',

      // Describe the narrow without sending sensitive data to Sentry.
      narrow: caseNarrow(fetchArgs.narrow, {
        stream: name => 'stream',
        topic: (streamName, topic) => 'topic',
        pm: ids => (ids.length > 1 ? 'pm (group)' : 'pm (1:1)'),
        home: () => 'all',
        starred: () => 'starred',
        mentioned: () => 'mentioned',
        allPrivate: () => 'all-pm',
        search: query => 'search',
      }),

      anchor: fetchArgs.anchor,
      numBefore: fetchArgs.numBefore,
      numAfter: fetchArgs.numAfter,
    });
    throw e;
  }
};

export const fetchOlder = (narrow: Narrow): ThunkAction<void> => (dispatch, getState) => {
  const state = getState();
  const firstMessageId = getFirstMessageId(state, narrow);
  const caughtUp = getCaughtUpForNarrow(state, narrow);
  const fetching = getFetchingForNarrow(state, narrow);
  const { loading } = getSession(state);

  if (!loading && !fetching.older && !caughtUp.older && firstMessageId !== undefined) {
    dispatch(
      fetchMessages({
        narrow,
        anchor: firstMessageId,
        numBefore: config.messagesPerRequest,
        numAfter: 0,
      }),
    );
  }
};

export const fetchNewer = (narrow: Narrow): ThunkAction<void> => (dispatch, getState) => {
  const state = getState();
  const lastMessageId = getLastMessageId(state, narrow);
  const caughtUp = getCaughtUpForNarrow(state, narrow);
  const fetching = getFetchingForNarrow(state, narrow);
  const { loading } = getSession(state);

  if (!loading && !fetching.newer && !caughtUp.newer && lastMessageId !== undefined) {
    dispatch(
      fetchMessages({
        narrow,
        anchor: lastMessageId,
        numBefore: 0,
        numAfter: config.messagesPerRequest,
      }),
    );
  }
};

const registerStart = (): PerAccountAction => ({
  type: REGISTER_START,
});

const registerAbortPlain = (reason: RegisterAbortReason): PerAccountAction => ({
  type: REGISTER_ABORT,
  reason,
});

export const registerAbort = (reason: RegisterAbortReason): ThunkAction<Promise<void>> => async (
  dispatch,
  getState,
) => {
  dispatch(registerAbortPlain(reason));
  if (getHaveServerData(getState())) {
    // Try again, forever if necessary; the user has an interactable UI and
    // can look at stale data while waiting.
    //
    // Do so by lying that the server has told us our queue is invalid and
    // we need a new one. Note that this must fire *after*
    // `registerAbortPlain()`, so that AppDataFetcher sees
    // `needsInitialFetch` go from `false` to `true`. We don't call
    // `doInitialFetch` directly here because that would go against
    // `AppDataFetcher`'s implicit interface. (Also, `needsInitialFetch` is
    // dubiously being read outside `AppDataFetcher`, in
    // `fetchOlder`/`fetchNewer`, and we don't want to break something
    // there.)
    //
    // TODO: Clean up all this brittle logic.
    // TODO: Instead, let the retry be on-demand, with a banner.
    dispatch(deadQueue()); // eslint-disable-line no-use-before-define
  } else {
    // Tell the user we've given up and let them try the same account or a
    // different account from the account picker.
    showErrorAlert(
      // TODO: Set up these user-facing strings for translation once
      // `initialFetchAbort`'s callers all have access to a `GetText`
      // function. As of adding the strings, the initial fetch is dispatched
      // from `AppDataFetcher` which isn't a descendant of
      // `TranslationProvider`.
      'Connection failed',
      (() => {
        const realmStr = getIdentity(getState()).realm.toString();
        switch (reason) {
          case 'server':
            return getIsAdmin(getState())
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

/** Private; exported only for tests. */
export const isFetchNeededAtAnchor = (
  state: PerAccountState,
  narrow: Narrow,
  anchor: number,
): boolean => {
  // Ideally this would detect whether, even if we don't have *all* the
  // messages in the narrow, we have enough of them around the anchor
  // to show a message list already.  For now it's simple and cautious.
  const caughtUp = getCaughtUpForNarrow(state, narrow);
  return !(caughtUp.newer && caughtUp.older);
};

/**
 * Fetch messages in the given narrow, around the given anchor.
 *
 * For almost all types of data we need from the server, the magic of the
 * Zulip event system provides us a complete, updating view of all the data
 * we could want.  For background and links to docs, see `MessagesState` and
 * `doInitialFetch`.
 *
 * Message data is the one major exception, where as a result we have to go
 * fetch more data from the server as the user navigates around.
 *
 * This is the main function used for that, especially as the user navigates
 * to a given narrow.
 *
 * See also the `message` event and corresponding `EVENT_NEW_MESSAGE`
 * action, which is how we learn about new messages in real time.
 *
 * See also handlers for the `MESSAGE_FETCH_COMPLETE` action, which this
 * dispatches with the data it receives from the server.
 */
export const fetchMessagesInNarrow = (
  narrow: Narrow,
  anchor: number = FIRST_UNREAD_ANCHOR,
): ThunkAction<Promise<Message[] | void>> => async (dispatch, getState) => {
  if (!isFetchNeededAtAnchor(getState(), narrow, anchor)) {
    return undefined;
  }
  return dispatch(
    fetchMessages({
      narrow,
      anchor,
      numBefore: config.messagesPerRequest / 2,
      numAfter: config.messagesPerRequest / 2,
    }),
  );
};

/**
 * Fetch the few most recent PMs.
 *
 * For old servers, we do this eagerly in `doInitialFetch`, in order to
 * let us show something useful in the PM conversations screen.
 * Zulip Server 2.1 added a custom-made API to help us do this better;
 * see #3133.
 *
 * See `fetchMessagesInNarrow` for further background.
 */
// TODO(server-2.1): Delete this.
const fetchPrivateMessages = () => async (dispatch, getState) => {
  const auth = getAuth(getState());
  const { messages, found_newest, found_oldest } = await api.getMessages(auth, {
    narrow: apiNarrowOfNarrow(ALL_PRIVATE_NARROW, getAllUsersById(getState())),
    anchor: LAST_MESSAGE_ANCHOR,
    numBefore: 100,
    numAfter: 0,
  });
  dispatch(
    messageFetchComplete({
      messages,
      narrow: ALL_PRIVATE_NARROW,
      anchor: LAST_MESSAGE_ANCHOR,
      numBefore: 100,
      numAfter: 0,
      foundNewest: found_newest,
      foundOldest: found_oldest,
      ownUserId: getOwnUserId(getState()),
    }),
  );
};

/**
 * Makes a request with a timeout. If asked, retries on
 * server/network operational errors until success.
 *
 * Waits between retries with a backoff.
 *
 * Other, non-retryable errors (client errors and all unexpected errors)
 * will always propagate to the caller to be handled.
 *
 * The timeout's length is `config.requestLongTimeoutMs` and it is absolute:
 * it triggers after that time has elapsed no matter whether the time was
 * spent waiting to hear back from one request, or retrying a request
 * unsuccessfully many times. The time spent waiting in backoff is included
 * in that.
 */
export async function tryFetch<T>(
  func: () => Promise<T>,
  shouldRetry?: boolean = true,
): Promise<T> {
  const backoffMachine = new BackoffMachine();

  // TODO: Use AbortController instead of this stateful flag; #4170
  let timerHasExpired = false;

  try {
    return await promiseTimeout(
      (async () => {
        // eslint-disable-next-line no-constant-condition
        while (true) {
          if (timerHasExpired) {
            // No one is listening for this Promise to settle, so stop
            // doing more work.
            throw new Error();
          }
          try {
            return await func();
          } catch (e) {
            if (!(shouldRetry && (e instanceof Server5xxError || e instanceof NetworkError))) {
              throw e;
            }
          }
          await backoffMachine.wait();
        }
      })(),
      config.requestLongTimeoutMs,
    );
  } catch (e) {
    if (e instanceof TimeoutError) {
      timerHasExpired = true;
    }
    throw e;
  }
}

/**
 * Fetch lots of state from the server, and start an event queue.
 *
 * This is where we set up our use of the Zulip event system for real-time
 * updates, calling its `/register` endpoint and starting an async loop to
 * poll for events.  For background on the Zulip event system and how we use
 * it, see docs from the client-side perspective:
 *   https://github.com/zulip/zulip-mobile/blob/main/docs/architecture/realtime.md
 * and a mainly server-side perspective:
 *   https://zulip.readthedocs.io/en/latest/subsystems/events-system.html
 *
 * Also do some miscellaneous other work we want to do when starting
 * up, or regaining a network connection. We fetch private messages
 * here so that we can show something useful in the PM conversations
 * screen, but we hope to stop doing this soon (see note at
 * `fetchPrivateMessages`). We fetch messages in a few other places:
 * to initially populate a message list (`ChatScreen`), to grab more
 * messages on scrolling to the top or bottom of the message list
 * (`fetchOlder` and `fetchNewer`), and to grab search results
 * (`SearchMessagesScreen`).
 */
export const doInitialFetch = (): ThunkAction<Promise<void>> => async (dispatch, getState) => {
  dispatch(registerStart());
  const auth = getAuth(getState());

  let initData: InitialData;

  const haveServerData = getHaveServerData(getState());

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
  } catch (e) {
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
      logging.warn(e, {
        message: 'Unexpected error during /register.',
      });
    }
    return;
  }
  dispatch(registerComplete(initData));

  dispatch(startEventPolling(initData.queue_id, initData.last_event_id));

  const serverVersion = new ZulipVersion(initData.zulip_version);
  if (!serverVersion.isAtLeast(MIN_RECENTPMS_SERVER_VERSION)) {
    dispatch(fetchPrivateMessages());
  }

  dispatch(sendOutbox());
  dispatch(initNotifications());
};

export const uploadFile = (
  destinationNarrow: Narrow,
  uri: string,
  name: string,
): ThunkAction<Promise<void>> => async (dispatch, getState) => {
  const auth = getAuth(getState());
  const response = await api.uploadFile(auth, uri, name);
  const messageToSend = `[${name}](${response.uri})`;

  dispatch(addToOutbox(destinationNarrow, messageToSend));
};
