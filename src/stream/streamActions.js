import { Auth, getMessages } from '../api/ApiClient';

export const STREAM_FETCHING_MESSAGES = 'STREAM_FETCHING_MESSAGES';
export const STREAM_NEW_MESSAGES = 'STREAM_NEW_MESSAGES';
export const STREAM_FETCHING_FAILED = 'STREAM_FETCHING_FAILED';

export const getLatestMessages = (auth: Auth, lastMessageId) =>
  async (dispatch) => {
    // Tell the UI we're fetching
    dispatch({ type: STREAM_FETCHING_MESSAGES });

    try {
      const messages = await getMessages(auth, 0, 0, 40);

      dispatch({
        type: STREAM_NEW_MESSAGES,
        messages,
      });
    } catch (err) {
      dispatch({ type: STREAM_FETCHING_FAILED, error: err.message });
    }
  };
