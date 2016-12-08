import { Auth } from '../api/apiFetch';
import { getMessages } from '../api';
import {
  MESSAGE_FETCH_START,
  MESSAGE_FETCH_SUCCESS,
} from '../constants';

export const fetchMessages = (
  auth,
  anchor: number,
  numBefore: number,
  numAfter: number,
  narrow,
  isNewNarrow,
) =>
  async (dispatch) => {
    dispatch({ type: MESSAGE_FETCH_START, narrow, isNewNarrow });

    const messages = await getMessages(
      auth: Auth,
      anchor: number,
      numBefore: number,
      numAfter: number,
      narrow,
    );

    dispatch({
      type: MESSAGE_FETCH_SUCCESS,
      auth,
      messages,
      anchor,
      narrow,
      caughtUp: (numAfter >= numBefore &&
        messages.length < numAfter + numBefore + (numBefore ? 1 : 0)),
    });
  };
