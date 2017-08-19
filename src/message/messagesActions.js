/* @flow */
import type { Action, Narrow, Dispatch, GetState } from '../types';
import { getMessages } from '../api';
import { registerAppActivity } from '../utils/activity';
import {
  getAuth,
  getAllMessages,
  getFirstMessageId,
  getLastMessageId,
  getCaughtUpForActiveNarrow,
} from '../selectors';
import config from '../config';
import {
  SWITCH_NARROW,
  MESSAGE_FETCH_START,
  MESSAGE_FETCH_SUCCESS,
  MARK_MESSAGES_READ,
} from '../actionConstants';

export const switchNarrow = (narrow: Narrow): Action => ({
  type: SWITCH_NARROW,
  narrow,
});

export const messageFetchStart = (
  narrow: Narrow,
  fetchingOlder: boolean,
  fetchingNewer: boolean,
): Action => ({
  type: MESSAGE_FETCH_START,
  narrow,
  fetchingOlder,
  fetchingNewer,
});

export const messageFetchSuccess = (
  messages: any[],
  narrow: Narrow,
  anchor: number,
  numBefore: number,
  numAfter: number,
  replaceExisting: boolean = false,
): Action => ({
  type: MESSAGE_FETCH_SUCCESS,
  messages,
  narrow,
  anchor,
  numBefore,
  numAfter,
  replaceExisting,
});

export const backgroundFetchMessages = (
  anchor: number,
  numBefore: number,
  numAfter: number,
  narrow: Narrow,
  useFirstUnread: boolean = false,
): Action => async (dispatch: Dispatch, getState: GetState) => {
  const messages = await getMessages(
    getAuth(getState()),
    anchor,
    numBefore,
    numAfter,
    narrow,
    useFirstUnread,
  );

  dispatch(messageFetchSuccess(messages, narrow, anchor, numBefore, numAfter));
};

export const fetchMessages = (
  anchor: number,
  numBefore: number,
  numAfter: number,
  narrow: Narrow,
  useFirstUnread: boolean = false,
): Action => async (dispatch: Dispatch) => {
  dispatch(messageFetchStart(narrow, numBefore > 0, numAfter > 0));
  dispatch(backgroundFetchMessages(anchor, numBefore, numAfter, narrow, useFirstUnread));
};

export const fetchMessagesAtFirstUnread = (narrow: Narrow): Action =>
  fetchMessages(0, config.messagesPerRequest / 2, config.messagesPerRequest / 2, narrow, true);

export const markMessagesRead = (messageIds: number[]): Action => ({
  type: MARK_MESSAGES_READ,
  messageIds,
});

export const fetchOlder = () => (dispatch: Dispatch, getState: GetState): Action => {
  const state = getState();
  const anchor = getFirstMessageId(state);
  const caughtUp = getCaughtUpForActiveNarrow(state);
  const { fetchingOlder, narrow } = state.chat;

  if (!fetchingOlder && !caughtUp.older && anchor) {
    dispatch(fetchMessages(anchor.older, config.messagesPerRequest, 0, narrow));
  }
};

export const fetchNewer = () => (dispatch: Dispatch, getState: GetState): Action => {
  const state = getState();
  const anchor = getLastMessageId(state);
  const caughtUp = getCaughtUpForActiveNarrow(state);
  const { fetchingNewer, narrow } = state.chat;

  if (!fetchingNewer && !caughtUp.newer && anchor) {
    dispatch(fetchMessages(anchor.newer, 0, config.messagesPerRequest, narrow));
  }
};

export const doNarrow = (newNarrow: Narrow, anchor: number = Number.MAX_SAFE_INTEGER): Action => (
  dispatch: Dispatch,
  getState: GetState,
) => {
  const auth = getAuth(getState());
  const anyMessagesInNewNarrow = JSON.stringify(newNarrow) in getAllMessages(getState());

  if (!anyMessagesInNewNarrow) {
    dispatch(fetchMessagesAtFirstUnread(newNarrow));
  }
  registerAppActivity(auth);
  dispatch(switchNarrow(newNarrow));
};
