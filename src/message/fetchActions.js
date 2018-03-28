/* @flow */
import type { Action, Narrow, Dispatch, GetState } from '../types';
import { getMessages, getStreams, registerForEvents, uploadFile } from '../api';
import {
  getAuth,
  getSession,
  getFirstMessageId,
  getLastMessageId,
  getCaughtUpForActiveNarrow,
  getFetchingForActiveNarrow,
  getPushToken,
  getTopMostNarrow,
} from '../selectors';
import config from '../config';
import {
  INITIAL_FETCH_START,
  INITIAL_FETCH_COMPLETE,
  MESSAGE_FETCH_START,
  MESSAGE_FETCH_COMPLETE,
  MARK_MESSAGES_READ,
} from '../actionConstants';
import { logout } from '../account/accountActions';
import timing from '../utils/timing';
import { allPrivateNarrow } from '../utils/narrow';
import { tryUntilSuccessful } from '../utils/async';
import { refreshNotificationToken } from '../utils/notifications';
import { initStreams } from '../streams/streamsActions';
import { sendFocusPing } from '../users/usersActions';
import { initNotifications, realmInit } from '../realm/realmActions';
import { addToOutbox, trySendMessages } from '../outbox/outboxActions';
import { startEventPolling } from '../events/eventActions';

export const messageFetchStart = (narrow: Narrow, numBefore: number, numAfter: number): Action => ({
  type: MESSAGE_FETCH_START,
  narrow,
  numBefore,
  numAfter,
});

export const messageFetchComplete = (
  messages: any[],
  narrow: Narrow,
  anchor: number,
  numBefore: number,
  numAfter: number,
  replaceExisting: boolean = false,
): Action => async (dispatch: Dispatch, getState: GetState) =>
  dispatch({
    type: MESSAGE_FETCH_COMPLETE,
    messages,
    narrow,
    anchor,
    numBefore,
    numAfter,
    replaceExisting,
  });

export const backgroundFetchMessages = (
  narrow: Narrow,
  anchor: number,
  numBefore: number,
  numAfter: number,
  useFirstUnread: boolean = false,
): Action => async (dispatch: Dispatch, getState: GetState) => {
  const messages = await getMessages(
    getAuth(getState()),
    narrow,
    anchor,
    numBefore,
    numAfter,
    useFirstUnread,
  );

  dispatch(messageFetchComplete(messages, narrow, anchor, numBefore, numAfter));
};

export const fetchMessages = (
  narrow: Narrow,
  anchor: number,
  numBefore: number,
  numAfter: number,
  useFirstUnread: boolean = false,
): Action => async (dispatch: Dispatch) => {
  dispatch(messageFetchStart(narrow, numBefore, numAfter));
  dispatch(backgroundFetchMessages(narrow, anchor, numBefore, numAfter, useFirstUnread));
};

export const fetchMessagesAroundAnchor = (narrow: Narrow, anchor: number): Action =>
  fetchMessages(
    narrow,
    anchor,
    config.messagesPerRequest / 2,
    config.messagesPerRequest / 2,
    false,
  );

export const fetchMessagesAtFirstUnread = (narrow: Narrow): Action =>
  fetchMessages(narrow, 0, config.messagesPerRequest / 2, config.messagesPerRequest / 2, true);

export const markMessagesRead = (messageIds: number[]): Action => ({
  type: MARK_MESSAGES_READ,
  messageIds,
});

export const fetchOlder = (narrow: Narrow) => (dispatch: Dispatch, getState: GetState): Action => {
  const state = getState();
  const firstMessageId = getFirstMessageId(narrow)(state);
  const caughtUp = getCaughtUpForActiveNarrow(narrow)(state);
  const fetching = getFetchingForActiveNarrow(narrow)(state);
  const { needsInitialFetch } = getSession(state);

  if (!needsInitialFetch && !fetching.older && !caughtUp.older && firstMessageId) {
    dispatch(fetchMessages(narrow, firstMessageId, config.messagesPerRequest, 0));
  }
};

export const fetchNewer = (narrow: Narrow) => (dispatch: Dispatch, getState: GetState): Action => {
  const state = getState();
  const lastMessageId = getLastMessageId(narrow)(state);
  const caughtUp = getCaughtUpForActiveNarrow(narrow)(state);
  const fetching = getFetchingForActiveNarrow(narrow)(state);
  const { needsInitialFetch } = getSession(state);

  if (!needsInitialFetch && !fetching.newer && !caughtUp.newer && lastMessageId) {
    dispatch(fetchMessages(narrow, lastMessageId, 0, config.messagesPerRequest));
  }
};

export const initialFetchStart = (): Action => ({
  type: INITIAL_FETCH_START,
});

export const initialFetchComplete = (): Action => ({
  type: INITIAL_FETCH_COMPLETE,
});

export const fetchRestOfInitialData = (): Action => async (
  dispatch: Dispatch,
  getState: GetState,
) => {
  const auth = getAuth(getState());
  const pushToken = getPushToken(getState());

  timing.start('Rest of server data');
  const [messages, streams] = await Promise.all([
    await tryUntilSuccessful(() =>
      getMessages(auth, allPrivateNarrow, Number.MAX_SAFE_INTEGER, 100, 0),
    ),
    await tryUntilSuccessful(() => getStreams(auth)),
  ]);
  timing.end('Rest of server data');

  dispatch(messageFetchComplete(messages, allPrivateNarrow, Number.MAX_SAFE_INTEGER, 100, 0, true));
  dispatch(initStreams(streams));
  if (auth.apiKey !== '' && (pushToken === '' || pushToken === undefined)) {
    refreshNotificationToken();
  }
  dispatch(trySendMessages());
};

export const fetchEssentialInitialData = (): Action => async (
  dispatch: Dispatch,
  getState: GetState,
) => {
  dispatch(initialFetchStart());
  const auth = getAuth(getState());
  const halfCount = Math.trunc(config.messagesPerRequest / 2);

  timing.start('Essential server data');
  // only fetch messages if chat scrren is at the top of stack
  // get narrow of top most chat screen in the stack
  const narrow = getTopMostNarrow(getState());
  const [initData, messages] = await Promise.all([
    await tryUntilSuccessful(() => registerForEvents(auth)),
    narrow &&
      (await tryUntilSuccessful(() => getMessages(auth, narrow, 0, halfCount, halfCount, true))),
  ]);

  timing.end('Essential server data');

  if (initData === 401) {
    dispatch(logout(auth));
    return;
  }

  dispatch(fetchRestOfInitialData());

  dispatch(realmInit(initData));

  if (narrow && messages) {
    dispatch(messageFetchComplete(messages, narrow, 0, halfCount, halfCount, true));
  }
  dispatch(initialFetchComplete());

  dispatch(startEventPolling(initData.queue_id, initData.last_event_id));
};

export const doInitialFetch = (): Action => async (dispatch: Dispatch, getState: GetState) => {
  dispatch(fetchEssentialInitialData());

  if (config.enableNotifications) {
    dispatch(initNotifications());
  }
  dispatch(sendFocusPing());
  setInterval(() => sendFocusPing(), 60 * 1000);
};

export const uploadImage = (narrow: Narrow, uri: string, name: string): Action => async (
  dispatch: Dispatch,
  getState: GetState,
) => {
  const auth = getAuth(getState());
  const serverUri = await uploadFile(auth, uri, name);
  const messageToSend = `[${name}](${serverUri})`;

  dispatch(addToOutbox(narrow, messageToSend));
};
