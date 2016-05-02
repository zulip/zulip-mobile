import ApiClient from '../api/client.js';

export const LOGIN_ATTEMPTED = 'LOGIN_ATTEMPTED';
export const LOGIN_SUCCEEDED = 'LOGIN_SUCCEEDED';
export const LOGIN_FAILED = 'LOGIN_FAILED';
export const LOGIN_TIMED_OUT = 'LOGIN_TIMED_OUT';

export const attemptLogin = (realm, email, password) =>
  (dispatch) => {
    // Tell the UI to display a spinner
    dispatch({ type: LOGIN_ATTEMPTED });

    // Create a new API client for this realm and try to log the user in
    const apiClient = new ApiClient(realm);
    apiClient.fetchApiKey(email, password).then((apiKey) => {
      // Authentication succeeded and we have an api key
      dispatch({
        type: LOGIN_SUCCEEDED,
        email,
        apiKey,
        apiClient,
      });
    }).catch((err) => {
      console.log(err);
      // Authentication failed
      dispatch({ type: LOGIN_FAILED });
    });
  };
