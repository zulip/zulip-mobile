import ApiClient from '../api/ApiClient.js';

export const LOGIN_ATTEMPTED = 'LOGIN_ATTEMPTED';
export const LOGIN_SUCCEEDED = 'LOGIN_SUCCEEDED';
export const LOGIN_FAILED = 'LOGIN_FAILED';
export const LOGIN_TIMED_OUT = 'LOGIN_TIMED_OUT';

export const DEV_EMAILS_FETCHING = 'DEV_EMAILS_FETCHING';
export const DEV_EMAILS_FETCHED = 'DEV_EMAILS_FETCHED';
export const DEV_EMAILS_FAILED = 'DEV_EMAILS_FAILED';

export const attemptLogin = (realm, email, password) =>
  (dispatch) => {
    // Tell the UI to display a spinner
    dispatch({ type: LOGIN_ATTEMPTED });

    // Create a new API client for this realm and try to log the user in
    ApiClient.fetchApiKey(realm, email, password)
    .then((raw) => raw.json())
    .then((res) => {
      if (res.result === 'success') {
        // Authentication succeeded and we have an api key
        dispatch({
          type: LOGIN_SUCCEEDED,
          email,
          apiKey: res.api_key,
        });
      } else {
        dispatch({ type: LOGIN_FAILED });
      }
    }).catch((err) => {
      console.error(err);
      dispatch({ type: LOGIN_FAILED });
    });
  };

export const attemptDevLogin = (realm, email) =>
  (dispatch) => {
    // Tell the UI to display a spinner
    dispatch({ type: LOGIN_ATTEMPTED });

    // Create a new API client for this realm and try to log the user in
    ApiClient.devFetchApiKey(realm, email).then((raw) => raw.json())
    .then((res) => {
      console.log(res);
      if (res.result === 'success') {
        // Authentication succeeded and we have an api key
        dispatch({
          type: LOGIN_SUCCEEDED,
          email,
          apiKey: res.api_key,
        });
      } else {
        // Authentication failed
        dispatch({ type: LOGIN_FAILED });
      }
    }).catch((err) => {
      console.error(err);
      dispatch({ type: LOGIN_FAILED });
    });
  };

export const getDevAccounts = (realm) =>
  (dispatch) => {
    dispatch({ type: DEV_EMAILS_FETCHING });

    ApiClient.devGetEmails(realm).then((raw) => raw.json())
    .then((res) => {
      if (res.result === 'success') {
        // Authentication succeeded and we have an api key
        console.log(res);
          dispatch({
            type: DEV_EMAILS_FETCHED,
            directUsers: res.direct_users,
            directAdmins: res.direct_admins,
          });
      } else {
        dispatch({ type: DEV_EMAILS_FAILED });
      }
    }).catch((err) => {
      console.error(err);
      dispatch({ type: DEV_EMAILS_FAILED });
    });
  };
