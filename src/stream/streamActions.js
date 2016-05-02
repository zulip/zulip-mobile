import ApiClient from '../api/client.js';

export const STREAM_FETCHING_MESSAGES = 'STREAM_FETCHING_MESSAGES';
export const STREAM_NEW_MESSAGES = 'STREAM_NEW_MESSAGES';
export const STREAM_FETCHING_FAILED = 'STREAM_FETCHING_FAILED';

export const getLatestMessages = (lastMessageId) =>
  (dispatch, getState) => {
    const apiClient = getState().account.apiClient;

    // Tell the UI we're fetching
    dispatch({ type: STREAM_FETCHING_MESSAGES });
    apiClient.getMessages(0, 0, 40).then((res) => {
      dispatch({
        type: STREAM_NEW_MESSAGES,
        messages: res.messages,
      });
    }).catch((err) => {
      console.log(err);
      dispatch({ type: STREAM_FETCHING_FAILED });
    });
  };
