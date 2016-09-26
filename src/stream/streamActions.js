import ApiClient from '../api/ApiClient';

export const STREAM_FETCHING_MESSAGES = 'STREAM_FETCHING_MESSAGES';
export const STREAM_FETCHED_MESSAGES = 'STREAM_FETCHED_MESSAGES';
export const STREAM_FETCHING_FAILED = 'STREAM_FETCHING_FAILED';

export const STREAM_SET_MESSAGES = 'STREAM_SET_MESSAGES';

export const setMessages = (messages, fetching = true, caughtUp = true) =>
  (dispatch) => {
    dispatch({
      type: STREAM_SET_MESSAGES,
      messages,
      fetching,
      caughtUp,
    });
  };

export const getMessages = (
  account,
  anchor,
  numBefore,
  numAfter,
  narrow
) =>
  async (dispatch) => {
    // Tell the UI we're fetching
    dispatch({ type: STREAM_FETCHING_MESSAGES });

    try {
      const messages = await ApiClient.getMessages(
        account,
        anchor,
        numBefore,
        numAfter,
        narrow
      );

      dispatch({
        type: STREAM_FETCHED_MESSAGES,
        account,
        messages,
        anchor,
        narrow,
        shouldAppend: numAfter > numBefore,
        caughtUp: (numAfter >= numBefore &&
          messages.length < numAfter + numBefore + (numBefore ? 1 : 0)),
      });
    } catch (err) {
      dispatch({ type: STREAM_FETCHING_FAILED, error: err.message });
    }
  };
