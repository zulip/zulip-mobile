import ApiClient from '../api/ApiClient.js';

export const STREAM_FETCHING_MESSAGES = 'STREAM_FETCHING_MESSAGES';
export const STREAM_NEW_MESSAGES = 'STREAM_NEW_MESSAGES';
export const STREAM_FETCHING_FAILED = 'STREAM_FETCHING_FAILED';

export const getLatestMessages = (account, lastMessageId) =>
  (dispatch) => {
    // Tell the UI we're fetching
    dispatch({ type: STREAM_FETCHING_MESSAGES });

    ApiClient.getMessages(account, 0, 0, 40)
    .then((res) => {
      if (res.result === 'success') {
        dispatch({
          type: STREAM_NEW_MESSAGES,
          account,
          messages: res.messages,
        });
      } else {
        dispatch({ type: STREAM_FETCHING_FAILED });
      }
    }).catch((err) => {
      console.error(err);
      dispatch({ type: STREAM_FETCHING_FAILED });
    });
  };
