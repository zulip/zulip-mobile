import { getMessages } from '../api';
import {
  CHAT_FETCHING_MESSAGES,
  CHAT_FETCHED_MESSAGES,
} from '../constants';

export const sendGetMessages = (
  auth,
  anchor: number,
  numBefore: number,
  numAfter: number,
  narrow
) =>
  async (dispatch) => {
    dispatch({ type: CHAT_FETCHING_MESSAGES });

    const messages = await getMessages(
      auth,
      anchor: number,
      numBefore: number,
      numAfter: number,
      narrow,
    );

    dispatch({
      type: CHAT_FETCHED_MESSAGES,
      auth,
      messages,
      anchor,
      narrow,
      shouldAppend: numAfter > numBefore,
      caughtUp: (numAfter >= numBefore &&
        messages.length < numAfter + numBefore + (numBefore ? 1 : 0)),
    });
  };
