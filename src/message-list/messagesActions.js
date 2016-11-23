import { getMessages } from '../api';
import {
  STREAM_FETCHING_MESSAGES,
  STREAM_FETCHED_MESSAGES,
  STREAM_SET_MESSAGES,
} from '../constants';

export const sendSetMessages = (
  messages: any[],
  fetching: boolean = true,
  caughtUp: boolean = true,
) =>
  (dispatch) => {
    dispatch({
      type: STREAM_SET_MESSAGES,
      messages,
      fetching,
      caughtUp,
    });
  };

export const sendGetMessages = (
  auth,
  anchor: number,
  numBefore: number,
  numAfter: number,
  narrow
) =>
  async (dispatch) => {
    dispatch({ type: STREAM_FETCHING_MESSAGES });

    const messages = await getMessages(
      auth,
      anchor: number,
      numBefore: number,
      numAfter: number,
      narrow,
    );

    dispatch({
      type: STREAM_FETCHED_MESSAGES,
      auth,
      messages,
      anchor,
      narrow,
      shouldAppend: numAfter > numBefore,
      caughtUp: (numAfter >= numBefore &&
        messages.length < numAfter + numBefore + (numBefore ? 1 : 0)),
    });
  };
