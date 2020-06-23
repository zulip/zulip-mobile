/* @flow strict-local */
import type {
  Narrow,
  Dispatch,
  GetState,
  GlobalState,
  Message,
  Action,
  ApiResponseServerSettings,
} from '../types';
import type { InitialData } from '../api/initialDataTypes';
import * as api from '../api';
import { isClientError } from '../api/apiErrors';
import {
  getAuth,
  getSession,
  getFirstMessageId,
  getLastMessageId,
  getCaughtUpForNarrow,
  getFetchingForNarrow,
  getTopMostNarrow,
} from '../selectors';
import config from '../config';
import {
  INITIAL_FETCH_START,
  INITIAL_FETCH_COMPLETE,
  INITIAL_FETCH_ABORT,
  MESSAGE_FETCH_START,
  MESSAGE_FETCH_COMPLETE,
} from '../actionConstants';
import { FIRST_UNREAD_ANCHOR, LAST_MESSAGE_ANCHOR } from '../anchor';
import { ALL_PRIVATE_NARROW } from '../utils/narrow';
import { BackoffMachine, promiseTimeout, TimeoutError } from '../utils/async';
import * as logging from '../utils/logging';
import { initNotifications } from '../notification/notificationActions';
import { addToOutbox, sendOutbox } from '../outbox/outboxActions';
import { realmInit } from '../realm/realmActions';
import { startEventPolling } from '../events/eventActions';
import { logout } from '../account/accountActions';
import { ZulipVersion } from '../utils/zulipVersion';

const messageFetchStart = (narrow: Narrow, numBefore: number, numAfter: number): Action => ({
  type: MESSAGE_FETCH_START,
  narrow,
  numBefore,
  numAfter,
});

export const messageFetchComplete = (args: {|
  messages: Message[],
  narrow: Narrow,
  anchor: number,
  numBefore: number,
  numAfter: number,
  foundNewest?: boolean,
  foundOldest?: boolean,
|}): Action => {
  const { messages, narrow, anchor, numBefore, numAfter, foundNewest, foundOldest } = args;
  return {
    type: MESSAGE_FETCH_COMPLETE,
    messages,
    narrow,
    anchor,
    numBefore,
    numAfter,
    foundNewest,
    foundOldest,
  };
};

/** PRIVATE: exported for tests only. */
export const fetchMessages = (
  narrow: Narrow,
  anchor: number,
  numBefore: number,
  numAfter: number,
) => async (dispatch: Dispatch, getState: GetState) => {
  const useFirstUnread = anchor === FIRST_UNREAD_ANCHOR;
  dispatch(messageFetchStart(narrow, numBefore, numAfter));
  const { messages, found_newest, found_oldest } = await api.getMessages(getAuth(getState()), {
    narrow,
    anchor,
    numBefore,
    numAfter,
    useFirstUnread,
  });
  dispatch(
    messageFetchComplete({
      messages,
      narrow,
      anchor,
      numBefore,
      numAfter,
      foundNewest: found_newest,
      foundOldest: found_oldest,
    }),
  );
};

export const fetchOlder = (narrow: Narrow) => (dispatch: Dispatch, getState: GetState) => {
  const state = getState();
  const firstMessageId = getFirstMessageId(state, narrow);
  const caughtUp = getCaughtUpForNarrow(state, narrow);
  const fetching = getFetchingForNarrow(state, narrow);
  const { needsInitialFetch } = getSession(state);

  if (!needsInitialFetch && !fetching.older && !caughtUp.older && firstMessageId !== undefined) {
    dispatch(fetchMessages(narrow, firstMessageId, config.messagesPerRequest, 0));
  }
};

export const fetchNewer = (narrow: Narrow) => (dispatch: Dispatch, getState: GetState) => {
  const state = getState();
  const lastMessageId = getLastMessageId(state, narrow);
  const caughtUp = getCaughtUpForNarrow(state, narrow);
  const fetching = getFetchingForNarrow(state, narrow);
  const { needsInitialFetch } = getSession(state);

  if (!needsInitialFetch && !fetching.newer && !caughtUp.newer && lastMessageId !== undefined) {
    dispatch(fetchMessages(narrow, lastMessageId, 0, config.messagesPerRequest));
  }
};

const initialFetchStart = (): Action => ({
  type: INITIAL_FETCH_START,
});

const initialFetchComplete = (): Action => ({
  type: INITIAL_FETCH_COMPLETE,
});

const initialFetchAbort = (): Action => ({
  type: INITIAL_FETCH_ABORT,
});

const isFetchNeededAtAnchor = (state: GlobalState, narrow: Narrow, anchor: number): boolean => {
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
) => async (dispatch: Dispatch, getState: GetState) => {
  if (!isFetchNeededAtAnchor(getState(), narrow, anchor)) {
    return;
  }
  dispatch(
    fetchMessages(narrow, anchor, config.messagesPerRequest / 2, config.messagesPerRequest / 2),
  );
};

/**
 * Fetch the few most recent PMs.
 *
 * We do this eagerly in `doInitialFetch`, where it mainly serves to let us
 * show something useful in the PM conversations screen.  Recent server
 * versions have a custom-made API to help us do this better, which we hope
 * to use soon: see #3133.
 *
 * See `fetchMessagesInNarrow` for further background.
 */
const fetchPrivateMessages = () => async (dispatch: Dispatch, getState: GetState) => {
  const auth = getAuth(getState());
  const { messages, found_newest, found_oldest } = await api.getMessages(auth, {
    narrow: ALL_PRIVATE_NARROW,
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
    }),
  );
};

/**
 * If we're navigated to a narrow, fetch messages for it.
 *
 * Specifically, fetch messages for the topmost narrow on the nav stack.
 *
 * We do this eagerly in `doInitialFetch`.  It's intended to ensure we get
 * messages appropriately if we're already narrowed when we do a fresh
 * initial fetch.
 *
 * See `fetchMessagesInNarrow` for further background.
 *
 * See also `doNarrow` which takes care of fetching messages for a narrow in
 * the common case, at the time the user narrows to it.
 */
const fetchTopMostNarrow = () => async (dispatch: Dispatch, getState: GetState) => {
  // only fetch messages if chat screen is at the top of stack
  // get narrow of top most chat screen in the stack
  const narrow = getTopMostNarrow(getState());
  if (narrow) {
    dispatch(fetchMessagesInNarrow(narrow));
  }
};

/**
 * Calls an async function and if unsuccessful retries the call.
 *
 * If the function is an API call and the response has HTTP status code 4xx
 * the error is considered unrecoverable and the exception is rethrown, to be
 * handled further up in the call stack.
 *
 * After a certain duration, times out with a TimeoutError.
 */
export async function tryFetch<T>(func: () => Promise<T>): Promise<T> {
  const MAX_TIME_MS: number = 60000;
  const backoffMachine = new BackoffMachine();

  // TODO: Use AbortController instead of this stateful flag; #4170
  let timerHasExpired = false;

  return promiseTimeout(
    (async () => {
      // eslint-disable-next-line no-constant-condition
      while (true) {
        if (timerHasExpired) {
          // No one is listening for this Promise's outcome, so stop
          // doing more work.
          throw new Error();
        }
        try {
          return await func();
        } catch (e) {
          if (isClientError(e)) {
            throw e;
          }
        }
        await backoffMachine.wait();
      }
      // Without this, Flow 0.92.1 does not know this code is unreachable,
      // and it incorrectly thinks Promise<undefined> could be returned,
      // which is inconsistent with the stated Promise<T> return type.
      // eslint-disable-next-line no-unreachable
      throw new Error();
    })(),
    MAX_TIME_MS,
    () => {
      timerHasExpired = true;
      throw new TimeoutError();
    },
  );
}

/**
 * Fetch lots of state from the server, and start an event queue.
 *
 * This is where we set up our use of the Zulip event system for real-time
 * updates, calling its `/register` endpoint and starting an async loop to
 * poll for events.  For background on the Zulip event system and how we use
 * it, see docs from the client-side perspective:
 *   https://github.com/zulip/zulip-mobile/blob/master/docs/architecture/realtime.md
 * and a mainly server-side perspective:
 *   https://zulip.readthedocs.io/en/latest/subsystems/events-system.html
 *
 * Also fetch some messages eagerly, and do some miscellaneous other work
 * we want to do when starting up, or regaining a network connection.
 */
export const doInitialFetch = () => async (dispatch: Dispatch, getState: GetState) => {
  dispatch(initialFetchStart());
  const auth = getAuth(getState());

  let initData: InitialData;
  let serverSettings: ApiResponseServerSettings;

  try {
    [initData, serverSettings] = await Promise.all([
      tryFetch(() =>
        api.registerForEvents(auth, {
          fetch_event_types: config.serverDataOnStartup,
          apply_markdown: true,
          include_subscribers: false,
          client_gravatar: true,
          client_capabilities: {
            notification_settings_null: true,
            bulk_message_deletion: true,
          },
        }),
      ),
      tryFetch(() => api.getServerSettings(auth.realm)),
    ]);
  } catch (e) {
    if (isClientError(e)) {
      dispatch(logout());
    } else if (e instanceof TimeoutError) {
      dispatch(initialFetchAbort());
    } else {
      logging.warn(e, {
        message: 'Unexpected error during initial fetch and serverSettings fetch.',
      });
    }
    return;
  }

  dispatch(realmInit(initData, new ZulipVersion(serverSettings.zulip_version)));
  dispatch(fetchTopMostNarrow());
  dispatch(initialFetchComplete());
  dispatch(startEventPolling(initData.queue_id, initData.last_event_id));

  dispatch(fetchPrivateMessages());

  const session = getSession(getState());
  if (session.lastNarrow) {
    dispatch(fetchMessagesInNarrow(session.lastNarrow));
  }

  dispatch(sendOutbox());
  dispatch(initNotifications());
};

export const uploadFile = (narrow: Narrow, uri: string, name: string) => async (
  dispatch: Dispatch,
  getState: GetState,
) => {
  const auth = getAuth(getState());
  const response = await api.uploadFile(auth, uri, name);
  const messageToSend = `[${name}](${response.uri})`;

  dispatch(addToOutbox(narrow, messageToSend));
};
