import { Auth, Narrow } from '../types';
import { getMessages } from '../api';
import { registerAppActivity } from '../utils/activity';
import { getAuth } from '../account/accountSelectors';
import config from '../config';
import {
  SWITCH_NARROW,
  MESSAGE_FETCH_START,
  MESSAGE_FETCH_SUCCESS,
  MARK_MESSAGES_READ,
  SET_REPLY_MODE,
} from '../actionConstants';

export const switchNarrow = (narrow) => ({
  type: SWITCH_NARROW,
  narrow,
});

export const setReplyMode = (replyMode: boolean) => ({
  type: SET_REPLY_MODE,
  replyMode,
});

export const doNarrow = (newNarrow, anchor: number = Number.MAX_SAFE_INTEGER) =>
  (dispatch, getState) => {
    registerAppActivity(getAuth(getState()));
    requestIdleCallback(() => dispatch(switchNarrow(newNarrow)));
  };

export const messageFetchStart = (narrow, fetching) => ({
  type: MESSAGE_FETCH_START,
  narrow,
  fetching,
});

export const messageFetchSuccess = (messages, narrow, fetching, caughtUp, replacePrevious) => ({
  type: MESSAGE_FETCH_SUCCESS,
  messages,
  narrow,
  fetching,
  caughtUp,
  replacePrevious,
});

export const backgroundFetchMessages = (
  auth: Auth,
  anchor: number,
  numBefore: number,
  numAfter: number,
  narrow: Narrow,
  useFirstUnread: boolean = false,
  replacePrevious: boolean = false,
) =>
  async (dispatch) => {
    const messages = await getMessages(
      auth,
      anchor,
      numBefore,
      numAfter,
      narrow,
      useFirstUnread,
      replacePrevious,
    );

    let caughtUp = { older: false, newer: false };
    if (!useFirstUnread) {
      // Find the anchor in the results (or set it past the end of the list)
      // We can use the position of the anchor to determine if we're caught up
      // in both directions.
      let anchorIdx = messages.findIndex(msg => msg.id === anchor);
      if (anchorIdx < 0) anchorIdx = messages.length;

      // If we're requesting messages before the anchor as well, then the server
      // returns one less than we expect (so as not to duplicate the anchor)
      const adjustment = numBefore > 0 ? -1 : 0;
      caughtUp = {
        ...(numBefore ? { older: anchorIdx + 1 < numBefore } : {}),
        ...(numAfter ? { newer: messages.length - anchorIdx + adjustment < numAfter } : {}),
      };
    }

    dispatch(messageFetchSuccess(
      messages,
      narrow,
      {
        ...(numBefore ? { older: false } : {}),
        ...(numAfter ? { newer: false } : {}),
      },
      caughtUp,
      replacePrevious,
    ));
  };

export const fetchMessages = (
  auth: Auth,
  anchor: number,
  numBefore: number,
  numAfter: number,
  narrow: Narrow,
  useFirstUnread: boolean = false,
  replacePrevious: boolean = false,
) =>
  async dispatch => {
    if (numBefore < 0 || numAfter < 0) {
      throw Error('numBefore and numAfter must >= 0');
    }

    dispatch(
      messageFetchStart(narrow, {
        ...(numBefore ? { older: true } : {}),
        ...(numAfter ? { newer: true } : {}),
      }),
    );
    dispatch(backgroundFetchMessages(
      auth,
      anchor,
      numBefore,
      numAfter,
      narrow,
      useFirstUnread,
      replacePrevious,
    ));
  };

export const fetchMessagesAtFirstUnread = (auth: Auth, narrow: Narrow) =>
  fetchMessages(
    auth,
    0,
    config.messagesPerRequest / 2,
    config.messagesPerRequest / 2,
    narrow,
    true,
  );

export const markMessagesRead = messageIds => ({
  type: MARK_MESSAGES_READ,
  messageIds,
});
