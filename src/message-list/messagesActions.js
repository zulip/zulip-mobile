import { getMessages } from '../api';
import {
  SWITCH_NARROW,
  MESSAGE_FETCH_START,
  MESSAGE_FETCH_SUCCESS,
} from '../constants';

export const switchNarrow = (narrow) => ({
  type: SWITCH_NARROW,
  narrow,
  fetching: { older: false, newer: false },
  caughtUp: { older: false, newer: false },
});

export const fetchMessages = (
  auth,
  anchor: number,
  numBefore: number,
  numAfter: number,
  narrow,
) =>
  async (dispatch) => {
    if (numBefore < 0 || numAfter < 0) {
      throw Error('numBefore and numAfter must >= 0');
    }

    dispatch({
      type: MESSAGE_FETCH_START,
      narrow,
      fetching: {
        ...numBefore ? { older: true } : {},
        ...numAfter ? { newer: true } : {},
      },
    });

    const messages = await getMessages(auth, anchor, numBefore, numAfter, narrow);

    // Find the anchor in the results (or set it past the end of the list)
    // We can use the position of the anchor to determine if we're caught up
    // in both directions.
    let anchorIdx = messages.findIndex((msg) => msg.id === anchor);
    if (anchorIdx < 0) anchorIdx = messages.length;

    dispatch({
      type: MESSAGE_FETCH_SUCCESS,
      auth,
      messages,
      anchor,
      narrow,
      fetching: {
        ...numBefore ? { older: false } : {},
        ...numAfter ? { newer: false } : {},
      },
      caughtUp: {
        ...numBefore ? { older: anchorIdx + 1 < numBefore } : {},
        ...numAfter ? { newer: messages.length - anchorIdx - 1 < numAfter } : {},
      },
    });
  };
