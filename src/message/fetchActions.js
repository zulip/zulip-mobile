/* @flow */
import type {
  Narrow,
  Dispatch,
  GetState,
  GlobalState,
  Message,
  MessageFetchStartAction,
  MessageFetchCompleteAction,
  MarkMessagesReadAction,
  InitialFetchStartAction,
  InitialFetchCompleteAction,
} from '../types';
import { getMessages, getStreams, registerForEvents, uploadFile } from '../api';
import {
  getAuth,
  getSession,
  getFirstMessageId,
  getLastMessageId,
  getCaughtUpForActiveNarrow,
  getFetchingForActiveNarrow,
} from '../selectors';
import config from '../config';
import {
  INITIAL_FETCH_START,
  INITIAL_FETCH_COMPLETE,
  MESSAGE_FETCH_START,
  MESSAGE_FETCH_COMPLETE,
  MARK_MESSAGES_READ,
} from '../actionConstants';
import { FIRST_UNREAD_ANCHOR, LAST_MESSAGE_ANCHOR } from '../constants';
import { ALL_PRIVATE_NARROW } from '../utils/narrow';
import { tryUntilSuccessful } from '../utils/async';
import { getFetchedMessagesForNarrow } from '../chat/narrowsSelectors';
import { initNotifications } from '../notification/notificationActions';
import { addToOutbox, trySendMessages } from '../outbox/outboxActions';
import { realmInit } from '../realm/realmActions';
import { initStreams } from '../streams/streamsActions';
import { reportPresence } from '../users/usersActions';
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
) => async (dispatch: Dispatch, getState: GetState) => {
  dispatch(messageFetchStart(narrow, numBefore, numAfter));
  const { messages } = await getMessages(
    getAuth(getState()),
    narrow,
    anchor,
    numBefore,
    numAfter,
    useFirstUnread,
  );
  dispatch(messageFetchComplete(messages, narrow, anchor, numBefore, numAfter));
};

export const fetchMessagesAroundAnchor = (narrow: Narrow, anchor: number) =>
  fetchMessages(
    narrow,
    anchor,
    config.messagesPerRequest / 2,
    config.messagesPerRequest / 2,
    false,
  );

export const fetchMessagesAtFirstUnread = (narrow: Narrow) =>
  fetchMessages(narrow, 0, config.messagesPerRequest / 2, config.messagesPerRequest / 2, true);

export const markMessagesRead = (messageIds: number[]): MarkMessagesReadAction => ({
  type: MARK_MESSAGES_READ,
  messageIds,
});

export const fetchOlder = (narrow: Narrow) => (dispatch: Dispatch, getState: GetState) => {
  const state = getState();
  const firstMessageId = getFirstMessageId(narrow)(state);
  const caughtUp = getCaughtUpForActiveNarrow(narrow)(state);
  const fetching = getFetchingForActiveNarrow(narrow)(state);
  const { needsInitialFetch } = getSession(state);

  if (!needsInitialFetch && !fetching.older && !caughtUp.older && firstMessageId) {
    dispatch(fetchMessages(narrow, firstMessageId, config.messagesPerRequest, 0));
  }
};

export const fetchNewer = (narrow: Narrow) => (dispatch: Dispatch, getState: GetState) => {
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

const needFetchAtFirstUnread = (state: GlobalState, narrow: Narrow): boolean => {
  const caughtUp = getCaughtUpForActiveNarrow(narrow)(state);
  if (caughtUp.newer && caughtUp.older) {
    return false;
  }
  const numKnownMessages = getFetchedMessagesForNarrow(narrow)(state).length;
  return numKnownMessages < config.messagesPerRequest / 2;
};

export const fetchMessagesInNarrow = (
  narrow: Narrow,
  anchor: number = FIRST_UNREAD_ANCHOR,
) => async (dispatch: Dispatch, getState: GetState) => {
  const state = getState();

  if (anchor === FIRST_UNREAD_ANCHOR) {
    if (needFetchAtFirstUnread(state, narrow)) {
      dispatch(fetchMessagesAtFirstUnread(narrow));
    }
  } else {
    dispatch(fetchMessagesAroundAnchor(narrow, anchor));
  }
};

export const fetchPrivateMessages = () => async (dispatch: Dispatch, getState: GetState) => {
  const auth = getAuth(getState());
  const { messages } = await tryUntilSuccessful(() =>
    getMessages(auth, ALL_PRIVATE_NARROW, LAST_MESSAGE_ANCHOR, 100, 0),
  );
  dispatch(messageFetchComplete(messages, ALL_PRIVATE_NARROW, LAST_MESSAGE_ANCHOR, 100, 0));
};

export const fetchStreams = () => async (dispatch: Dispatch, getState: GetState) => {
  const auth = getAuth(getState());
  const { streams } = await tryUntilSuccessful(() => getStreams(auth));
  dispatch(initStreams(streams));
};

export const fetchInitialData = () => async (dispatch: Dispatch, getState: GetState) => {
  dispatch(initialFetchStart());
  const auth = getAuth(getState());

  const initData = await tryUntilSuccessful(() =>
    registerForEvents(auth, {
      fetch_event_types: config.serverDataOnStartup,
      apply_markdown: true,
      include_subscribers: false,
      client_gravatar: true,
    }),
  );

  dispatch(realmInit(initData));
  dispatch(initialFetchComplete());
  dispatch(startEventPolling(initData.queue_id, initData.last_event_id));

  dispatch(fetchPrivateMessages());
  dispatch(fetchStreams());

  const session = getSession(getState());
  if (session.lastNarrow) {
    dispatch(fetchMessagesInNarrow(session.lastNarrow));
  }

  dispatch(trySendMessages());
};

export const doInitialFetch = () => async (dispatch: Dispatch, getState: GetState) => {
  dispatch(fetchInitialData());

  dispatch(initNotifications());
  dispatch(reportPresence());
  setInterval(() => dispatch(reportPresence()), 60 * 1000);
};

export const uploadImage = (narrow: Narrow, uri: string, name: string) => async (
  dispatch: Dispatch,
  getState: GetState,
) => {
  const auth = getAuth(getState());
  const response = await uploadFile(auth, uri, name);
  const messageToSend = `[${name}](${response.uri})`;

  dispatch(addToOutbox(narrow, messageToSend));
};
