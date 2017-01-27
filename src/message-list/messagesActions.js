import { getMessages } from '../api';
import {
  SWITCH_NARROW,
  MESSAGE_FETCH_START,
  MESSAGE_FETCH_SUCCESS,
} from '../constants';

export const switchNarrow = (narrow) => ({
  type: SWITCH_NARROW,
  narrow,
  fetching: [false, false],
  caughtUp: [false, false],
});

export const fetchMessages = (
  auth,
  anchor: number,
  numBefore: number,
  numAfter: number,
  narrow,
  fetching = [false, false],
  caughtUp,
) =>
  async (dispatch) => {
    dispatch({ type: MESSAGE_FETCH_START, narrow, fetching, caughtUp });

    const messages = await getMessages(auth, anchor, numBefore, numAfter, narrow);

    // Find the anchor in the results (or set it past the end of the list)
    // We can use the position of the anchor to determine if we're caught up
    // in both directions.
    let anchorIndex = messages.findIndex((msg) => msg.id === anchor);
    if (anchorIndex < 0) anchorIndex = messages.length;
    const newCaughtUp = [
      anchorIndex + 1 < numBefore,
      messages.length - anchorIndex - 1 < numAfter,
    ];

    dispatch({
      type: MESSAGE_FETCH_SUCCESS,
      auth,
      messages,
      anchor,
      narrow,
      fetching: [!fetching[0], !fetching[1]],
      caughtUp: newCaughtUp,
    });
  };
