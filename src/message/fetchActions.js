/* @flow */
import type {
  Narrow,
  Dispatch,
  GetState,
  Message,
  FetchMessagesAction,
  MessageFetchStartAction,
  MessageFetchCompleteAction,
  MarkMessagesReadAction,
  InitialFetchStartAction,
  InitialFetchCompleteAction,
} from '../types';
import { getMessages, getStreams, registerForEvents, uploadFile } from '../api';
import {
  getActiveAccount,
  getSession,
  getFirstMessageId,
  getLastMessageId,
  getCaughtUpForActiveNarrow,
  getFetchingForActiveNarrow,
  getPushToken,
} from '../selectors';
import config from '../config';
import {
  INITIAL_FETCH_START,
  INITIAL_FETCH_COMPLETE,
  MESSAGE_FETCH_START,
  MESSAGE_FETCH_COMPLETE,
  MARK_MESSAGES_READ,
} from '../actionConstants';
import { LAST_MESSAGE_ANCHOR } from '../constants';
import timing from '../utils/timing';
import { ALL_PRIVATE_NARROW } from '../utils/narrow';
import { tryUntilSuccessful } from '../utils/async';
import { refreshNotificationToken } from '../utils/notifications';
import { addToOutbox, trySendMessages } from '../outbox/outboxActions';
import { initNotifications, realmInit } from '../realm/realmActions';
import { initStreams } from '../streams/streamsActions';
import { sendFocusPing } from '../users/usersActions';
import { startEventPolling } from '../events/eventActions';

export const messageFetchStart = (
  narrow: Narrow,
  numBefore: number,
  numAfter: number,
): MessageFetchStartAction => ({
  type: MESSAGE_FETCH_START,
  narrow,
  numBefore,
  numAfter,
});

export const messageFetchComplete = (
  messages: Message[],
  narrow: Narrow,
  anchor: number,
  numBefore: number,
  numAfter: number,
): MessageFetchCompleteAction => ({
  type: MESSAGE_FETCH_COMPLETE,
  messages,
  narrow,
  anchor,
  numBefore,
  numAfter,
});

export const fetchMessages = (
  narrow: Narrow,
  anchor: number,
  numBefore: number,
  numAfter: number,
  useFirstUnread: boolean = false,
): FetchMessagesAction => async (dispatch: Dispatch, getState: GetState) => {
  dispatch(messageFetchStart(narrow, numBefore, numAfter));
  const messages = await getMessages(
    getActiveAccount(getState()),
    narrow,
    anchor,
    numBefore,
    numAfter,
    useFirstUnread,
  );
  dispatch(messageFetchComplete(messages, narrow, anchor, numBefore, numAfter));
};

export const fetchMessagesAroundAnchor = (narrow: Narrow, anchor: number): FetchMessagesAction =>
  fetchMessages(
    narrow,
    anchor,
    config.messagesPerRequest / 2,
    config.messagesPerRequest / 2,
    false,
  );

export const fetchMessagesAtFirstUnread = (narrow: Narrow): FetchMessagesAction =>
  fetchMessages(narrow, 0, config.messagesPerRequest / 2, config.messagesPerRequest / 2, true);

export const markMessagesRead = (messageIds: number[]): MarkMessagesReadAction => ({
  type: MARK_MESSAGES_READ,
  messageIds,
});

export const fetchOlder = (narrow: Narrow): FetchMessagesAction => (
  dispatch: Dispatch,
  getState: GetState,
) => {
  const state = getState();
  const firstMessageId = getFirstMessageId(narrow)(state);
  const caughtUp = getCaughtUpForActiveNarrow(narrow)(state);
  const fetching = getFetchingForActiveNarrow(narrow)(state);
  const { needsInitialFetch } = getSession(state);

  if (!needsInitialFetch && !fetching.older && !caughtUp.older && firstMessageId) {
    dispatch(fetchMessages(narrow, firstMessageId, config.messagesPerRequest, 0));
  }
};

export const fetchNewer = (narrow: Narrow): FetchMessagesAction => (
  dispatch: Dispatch,
  getState: GetState,
) => {
  const state = getState();
  const lastMessageId = getLastMessageId(narrow)(state);
  const caughtUp = getCaughtUpForActiveNarrow(narrow)(state);
  const fetching = getFetchingForActiveNarrow(narrow)(state);
  const { needsInitialFetch } = getSession(state);

  if (!needsInitialFetch && !fetching.newer && !caughtUp.newer && lastMessageId) {
    dispatch(fetchMessages(narrow, lastMessageId, 0, config.messagesPerRequest));
  }
};

export const initialFetchStart = (): InitialFetchStartAction => ({
  type: INITIAL_FETCH_START,
});

export const initialFetchComplete = (): InitialFetchCompleteAction => ({
  type: INITIAL_FETCH_COMPLETE,
});

export const fetchEssentialInitialData = () => async (dispatch: Dispatch, getState: GetState) => {
  dispatch(initialFetchStart());
  const account = getActiveAccount(getState());

  timing.start('Essential server data');
  const initData = await tryUntilSuccessful(() =>
    registerForEvents(account, config.trackServerEvents, config.serverDataOnStartup),
  );
  timing.end('Essential server data');

  dispatch(realmInit(initData));
  dispatch(initialFetchComplete());

  dispatch(startEventPolling(initData.queue_id, initData.last_event_id));
};

export const fetchRestOfInitialData = () => async (dispatch: Dispatch, getState: GetState) => {
  const account = getActiveAccount(getState());
  const pushToken = getPushToken(getState());

  timing.start('Rest of server data');
  const [messages, streams] = await Promise.all([
    await tryUntilSuccessful(() =>
      getMessages(account, ALL_PRIVATE_NARROW, LAST_MESSAGE_ANCHOR, 100, 0),
    ),
    await tryUntilSuccessful(() => getStreams(account)),
  ]);
  timing.end('Rest of server data');

  dispatch(messageFetchComplete(messages, ALL_PRIVATE_NARROW, LAST_MESSAGE_ANCHOR, 100, 0));
  dispatch(initStreams(streams));
  if (account.apiKey !== '' && (pushToken === '' || pushToken === undefined)) {
    refreshNotificationToken();
  }
  dispatch(trySendMessages());
};

export const doInitialFetch = () => async (dispatch: Dispatch, getState: GetState) => {
  dispatch(fetchEssentialInitialData());
  dispatch(fetchRestOfInitialData());

  dispatch(initNotifications());
  dispatch(sendFocusPing());
  setInterval(() => sendFocusPing(), 60 * 1000);
};

export const uploadImage = (narrow: Narrow, uri: string, name: string) => async (
  dispatch: Dispatch,
  getState: GetState,
) => {
  const account = getActiveAccount(getState());
  const serverUri = await uploadFile(account, uri, name);
  const messageToSend = `[${name}](${serverUri})`;

  dispatch(addToOutbox(narrow, messageToSend));
};
