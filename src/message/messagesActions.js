/* @flow */
import type { Action, Narrow, Dispatch, GetState } from '../types';
import { getMessages } from '../api';
import { registerAppActivity } from '../utils/activity';
import { getAuth, getAllMessages, getAnchor } from '../selectors';
import config from '../config';
import {
  SWITCH_NARROW,
  MESSAGE_FETCH_START,
  MESSAGE_FETCH_SUCCESS,
  MARK_MESSAGES_READ,
  POP_NARROW,
} from '../actionConstants';
import { navigateToChat } from '../nav/navActions';

export const switchNarrow = (narrow: Narrow): Action => ({
  type: SWITCH_NARROW,
  narrow,
});

export const popNarrow = (): Action => ({
  type: POP_NARROW,
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
  fetchingOlder: boolean = false,
  fetchingNewer: boolean = false,
  caughtUpOlder: boolean = false,
  caughtUpNewer: boolean = false,
  replaceExisting: boolean = false,
): Action => ({
  type: MESSAGE_FETCH_SUCCESS,
  messages,
  narrow,
  fetchingOlder,
  fetchingNewer,
  caughtUpOlder,
  caughtUpNewer,
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

  // Find the anchor in the results (or set it past the end of the list)
  // We can use the position of the anchor to determine if we're caught up
  // in both directions.
  const msgIndex = messages.findIndex(msg => msg.id === anchor);
  const anchorIdx = msgIndex === -1 ? messages.length : msgIndex;

  // If we're requesting messages before the anchor the server
  // returns one less than we expect (so as not to duplicate the anchor)
  const adjustment = numBefore > 0 ? -1 : 0;

  dispatch(
    messageFetchSuccess(
      messages,
      narrow,
      numBefore > 0,
      numAfter > 0,
      anchorIdx + 1 < numBefore,
      messages.length - anchorIdx + adjustment < numAfter,
    ),
  );
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
  const anchor = getAnchor(state);
  const { fetchingOlder, caughtUpOlder, narrow } = state.chat;

  if (!fetchingOlder && !caughtUpOlder && anchor) {
    dispatch(fetchMessages(anchor.older, config.messagesPerRequest, 0, narrow));
  }
};

export const fetchNewer = () => (dispatch: Dispatch, getState: GetState): Action => {
  const state = getState();
  const anchor = getAnchor(state);
  const { fetchingNewer, caughtUpNewer, narrow } = state.chat;

  if (!fetchingNewer && !caughtUpNewer && anchor) {
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
  dispatch(navigateToChat());
};
