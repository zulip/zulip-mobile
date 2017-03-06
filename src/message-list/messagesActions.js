import { getMessages, messagesFlags } from '../api';
import {
  SWITCH_NARROW,
  MESSAGE_FETCH_START,
  MESSAGE_FETCH_SUCCESS,
} from '../constants';

export const switchNarrow = (narrow, messages) => ({
  type: SWITCH_NARROW,
  narrow,
  messages,
});

export const messageFetchStart = (narrow, fetching) => ({
  type: MESSAGE_FETCH_START,
  narrow,
  fetching,
});

export const messageFetchSuccess = (messages, narrow, fetching, caughtUp) => ({
  type: MESSAGE_FETCH_SUCCESS,
  messages,
  narrow,
  fetching,
  caughtUp,
});

export const backgroundFetchMessages = (
  auth,
  anchor: number,
  numBefore: number,
  numAfter: number,
  narrow,
  useFirstUnread = false,
) =>
  async (dispatch) => {
    const messages = await getMessages(auth, anchor, numBefore, numAfter, narrow, useFirstUnread);

    let caughtUp = { older: false, newer: false };
    if (!useFirstUnread) {
      // Find the anchor in the results (or set it past the end of the list)
      // We can use the position of the anchor to determine if we're caught up
      // in both directions.
      let anchorIdx = messages.findIndex((msg) => msg.id === anchor);
      if (anchorIdx < 0) anchorIdx = messages.length;

      // If we're requesting messages before the anchor as well, then the server
      // returns one less than we expect (so as not to duplicate the anchor)
      const adjustment = numBefore > 0 ? -1 : 0;
      caughtUp = {
        ...numBefore ? { older: anchorIdx + 1 < numBefore } : {},
        ...numAfter ? { newer: messages.length - anchorIdx + adjustment < numAfter } : {},
      };
    }

    dispatch(messageFetchSuccess(
      messages,
      narrow,
      {
        ...numBefore ? { older: false } : {},
        ...numAfter ? { newer: false } : {},
      },
      caughtUp,
    ));
  };

export const fetchMessages = (
  auth,
  anchor: number,
  numBefore: number,
  numAfter: number,
  narrow,
  useFirstUnread = false,
) =>
  async (dispatch) => {
    if (numBefore < 0 || numAfter < 0) {
      throw Error('numBefore and numAfter must >= 0');
    }

    dispatch(messageFetchStart(
      narrow,
      {
        ...numBefore ? { older: true } : {},
        ...numAfter ? { newer: true } : {},
      },
    ));
    dispatch(backgroundFetchMessages(auth, anchor, numBefore, numAfter, narrow, useFirstUnread));
  };

export const updateMessageFlags = (auth, messageIds, op, flag) =>
  async (dispatch) => {
    await messagesFlags(auth, messageIds, op, flag);
  };
