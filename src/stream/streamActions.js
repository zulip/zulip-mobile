import ApiClient from '../api/ApiClient.js';

export const STREAM_FETCHING_MESSAGES = 'STREAM_FETCHING_MESSAGES';
export const STREAM_NEW_MESSAGES = 'STREAM_NEW_MESSAGES';
export const STREAM_FETCHING_FAILED = 'STREAM_FETCHING_FAILED';

export const getLatestMessages = (lastMessageId) =>
  (dispatch, getState) => {
    // Tell the UI we're fetching
    dispatch({ type: STREAM_FETCHING_MESSAGES });

    var account = getState().account;
    console.log(account);
    ApiClient.getMessages(account.realm, account.email, account.apiKey, 0, 0, 40)
    .then((raw) => raw.json())
    .then((res) => {
      if (res.result === 'success') {
        dispatch({
          type: STREAM_NEW_MESSAGES,
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
