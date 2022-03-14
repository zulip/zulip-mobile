/* @flow strict-local */
import * as logging from '../utils/logging';
import type {
  Auth,
  Narrow,
  PerAccountState,
  Message,
  PerAccountAction,
  Stream,
  ThunkAction,
  UserId,
} from '../types';
import * as api from '../api';
import { Server5xxError, NetworkError } from '../api/apiErrors';
import {
  getAuth,
  getSession,
  getFirstMessageId,
  getLastMessageId,
  getCaughtUpForNarrow,
  getFetchingForNarrow,
  getStreamsById,
  getZulipFeatureLevel,
} from '../selectors';
import config from '../config';
import {
  MESSAGE_FETCH_START,
  MESSAGE_FETCH_ERROR,
  MESSAGE_FETCH_COMPLETE,
} from '../actionConstants';
import { FIRST_UNREAD_ANCHOR, LAST_MESSAGE_ANCHOR } from '../anchor';
import { ALL_PRIVATE_NARROW, apiNarrowOfNarrow, caseNarrow, topicNarrow } from '../utils/narrow';
import { BackoffMachine, promiseTimeout, TimeoutError } from '../utils/async';
import { addToOutbox } from '../outbox/outboxActions';
import { getAllUsersById, getOwnUserId } from '../users/userSelectors';

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

const messageFetchError = (args: {| narrow: Narrow, error: mixed |}): PerAccountAction => {
  const { narrow, error } = args;
  return {
    type: MESSAGE_FETCH_ERROR,
    narrow,
    error,
  };
};

const messageFetchComplete = (args: {|
  messages: $ReadOnlyArray<Message>,
  narrow: Narrow,
  anchor: number,
  numBefore: number,
  numAfter: number,
  foundNewest: boolean,
  foundOldest: boolean,
  ownUserId: UserId,
|}): PerAccountAction => {
  const { messages, narrow, anchor, numBefore, numAfter, foundNewest, foundOldest, ownUserId } =
    args;
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
export const fetchMessages =
  (fetchArgs: {|
    narrow: Narrow,
    anchor: number,
    numBefore: number,
    numAfter: number,
  |}): ThunkAction<Promise<$ReadOnlyArray<Message>>> =>
  async (dispatch, getState) => {
    dispatch(messageFetchStart(fetchArgs.narrow, fetchArgs.numBefore, fetchArgs.numAfter));
    try {
      const { messages, found_newest, found_oldest } =
        // TODO: If `MESSAGE_FETCH_ERROR` isn't the right way to respond
        // to a timeout, maybe make a new action.
        // eslint-disable-next-line no-use-before-define
        await tryFetch(() =>
          api.getMessages(
            getAuth(getState()),
            {
              ...fetchArgs,
              narrow: apiNarrowOfNarrow(
                fetchArgs.narrow,
                getAllUsersById(getState()),
                getStreamsById(getState()),
              ),
              useFirstUnread: fetchArgs.anchor === FIRST_UNREAD_ANCHOR, // TODO: don't use this; see #4203
            },
            getZulipFeatureLevel(getState()),
          ),
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
    } catch (errorIllTyped) {
      const e: mixed = errorIllTyped; // https://github.com/facebook/flow/issues/2470
      dispatch(
        messageFetchError({
          narrow: fetchArgs.narrow,
          error: e,
        }),
      );
      // $FlowFixMe[incompatible-cast]: assuming caught exception was Error
      logging.warn((e: Error), {
        message: 'Message-fetch error',

        // Describe the narrow without sending sensitive data to Sentry.
        narrow: caseNarrow(fetchArgs.narrow, {
          stream: () => 'stream',
          topic: () => 'topic',
          pm: ids => (ids.length > 1 ? 'pm (group)' : 'pm (1:1)'),
          home: () => 'all',
          starred: () => 'starred',
          mentioned: () => 'mentioned',
          allPrivate: () => 'all-pm',
          search: () => 'search',
        }),

        anchor: fetchArgs.anchor,
        numBefore: fetchArgs.numBefore,
        numAfter: fetchArgs.numAfter,
      });
      throw e;
    }
  };

export const fetchOlder =
  (narrow: Narrow): ThunkAction<void> =>
  (dispatch, getState) => {
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

export const fetchNewer =
  (narrow: Narrow): ThunkAction<void> =>
  (dispatch, getState) => {
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

/** Some message ID in the conversation; void if there are none. */
// This corresponds to web's message_edit.with_first_message_id.  (Note
// it's actually the latest, despite the name; really just needs to be
// *some* message ID in the topic.)
export async function fetchSomeMessageIdForConversation(
  auth: Auth,
  streamId: number,
  topic: string,
  streamsById: Map<number, Stream>,
  zulipFeatureLevel: number,
): Promise<number | void> {
  const data = await api.getMessages(
    auth,
    {
      anchor: LAST_MESSAGE_ANCHOR,
      numBefore: 1,
      numAfter: 0,
      // TODO(server-2.1): These users and streams maps should go away;
      //   cut the streamsById param from this function too.
      // HACK: This fake, empty users map is OK because apiNarrowOfNarrow
      //   doesn't consult the users map for topic narrows.
      narrow: apiNarrowOfNarrow(topicNarrow(streamId, topic), new Map(), streamsById),
    },
    zulipFeatureLevel,
  );
  // FlowIssue: can be void because array can be empty
  const message: Message | void = data.messages[0];
  return message?.id;
}

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
 * `registerAndStartPolling`.
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
export const fetchMessagesInNarrow =
  (
    narrow: Narrow,
    anchor: number = FIRST_UNREAD_ANCHOR,
  ): ThunkAction<Promise<$ReadOnlyArray<Message> | void>> =>
  async (dispatch, getState) => {
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
 * For old servers, we do this eagerly in `registerAndStartPolling`, in order to
 * let us show something useful in the PM conversations screen.
 * Zulip Server 2.1 added a custom-made API to help us do this better;
 * see #3133.
 *
 * See `fetchMessagesInNarrow` for further background.
 */
// TODO(server-2.1): Delete this.
export const fetchPrivateMessages =
  (): ThunkAction<Promise<void>> => async (dispatch, getState) => {
    const auth = getAuth(getState());
    const { messages, found_newest, found_oldest } = await api.getMessages(
      auth,
      {
        narrow: apiNarrowOfNarrow(
          ALL_PRIVATE_NARROW,
          getAllUsersById(getState()),
          getStreamsById(getState()),
        ),
        anchor: LAST_MESSAGE_ANCHOR,
        numBefore: 100,
        numAfter: 0,
      },
      getZulipFeatureLevel(getState()),
    );
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
          } catch (errorIllTyped) {
            const e: mixed = errorIllTyped; // https://github.com/facebook/flow/issues/2470
            if (!(shouldRetry && (e instanceof Server5xxError || e instanceof NetworkError))) {
              throw e;
            }
          }
          await backoffMachine.wait();
        }

        // Without this, Flow 0.149.0 does not know this code is unreachable,
        // and it incorrectly thinks Promise<undefined> could be returned,
        // which is inconsistent with the stated Promise<T> return type.
        // eslint-disable-next-line no-unreachable
        throw new Error();
      })(),
      config.requestLongTimeoutMs,
    );
  } catch (errorIllTyped) {
    const e: mixed = errorIllTyped; // https://github.com/facebook/flow/issues/2470
    if (e instanceof TimeoutError) {
      timerHasExpired = true;
    }
    throw e;
  }
}

export const uploadFile =
  (destinationNarrow: Narrow, uri: string, name: string): ThunkAction<Promise<void>> =>
  async (dispatch, getState) => {
    const auth = getAuth(getState());
    const response = await api.uploadFile(auth, uri, name);
    const messageToSend = `[${name}](${response.uri})`;

    dispatch(addToOutbox(destinationNarrow, messageToSend));
  };
