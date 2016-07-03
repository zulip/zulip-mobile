import ApiClient from '../api/ApiClient.js';

export const ACCOUNT_ADD_SUCCEEDED = 'ACCOUNT_ADD_SUCCEEDED';
export const ACCOUNT_ADD_FAILED = 'ACCOUNT_ADD_FAILED';

export const LOGIN_ATTEMPTED = 'LOGIN_ATTEMPTED';
export const LOGIN_SUCCEEDED = 'LOGIN_SUCCEEDED';
export const LOGIN_FAILED = 'LOGIN_FAILED';
export const LOGIN_TIMED_OUT = 'LOGIN_TIMED_OUT';

export const DEV_EMAILS_FETCHING = 'DEV_EMAILS_FETCHING';
export const DEV_EMAILS_FETCHED = 'DEV_EMAILS_FETCHED';
export const DEV_EMAILS_FAILED = 'DEV_EMAILS_FAILED';

export const addAccount = (realm) =>
  async (dispatch) => {
    try {
      const authBackends = await ApiClient.getAuthBackends({
        realm,
        loggedIn: false,
      });

      if (authBackends) {
        dispatch({
          type: ACCOUNT_ADD_SUCCEEDED,
          realm,
          authBackends,
        });
      } else {
        dispatch({ type: ACCOUNT_ADD_FAILED });
      }
    } catch (err) {
      console.error(err);
      dispatch({ type: ACCOUNT_ADD_FAILED });
    }
  };

export const attemptLogin = (account, email, password) =>
  async (dispatch) => {
    // Tell the UI to display a spinner
    dispatch({ type: LOGIN_ATTEMPTED });

    try {
      const res = await ApiClient.fetchApiKey(account, email, password);

      if (res.result === 'success') {
        // Authentication succeeded and we have an api key
        dispatch({
          type: LOGIN_SUCCEEDED,
          account,
          activeBackend: 'password',
          email,
          apiKey: res.api_key,
        });
      } else {
        dispatch({
          type: LOGIN_FAILED,
          account,
        });
      }
    } catch (err) {
      console.error(err);
      dispatch({
        type: LOGIN_FAILED,
        account,
      });
    }
  };

export const attemptDevLogin = (account, email) =>
  async (dispatch) => {
    // Tell the UI to display a spinner
    dispatch({ type: LOGIN_ATTEMPTED });

    try {
      const res = await ApiClient.devFetchApiKey(account, email);

      if (res.result === 'success') {
        // Authentication succeeded and we have an api key
        dispatch({
          type: LOGIN_SUCCEEDED,
          account,
          activeBackend: 'dev',
          email,
          apiKey: res.api_key,
        });
      } else {
        // Authentication failed
        dispatch({
          type: LOGIN_FAILED,
          account,
        });
      }
    } catch (err) {
      console.error(err);
      dispatch({
        type: LOGIN_FAILED,
        account,
      });
    }
  };

export const getDevEmails = (account) =>
  async (dispatch) => {
    dispatch({ type: DEV_EMAILS_FETCHING });

    try {
      const res = await ApiClient.devGetEmails(account);

      if (res.result === 'success') {
        // Authentication succeeded and we have an api key
        dispatch({
          type: DEV_EMAILS_FETCHED,
          account,
          activeBackend: 'dev',
          directUsers: res.direct_users,
          directAdmins: res.direct_admins,
        });
      } else {
        dispatch({ type: DEV_EMAILS_FAILED });
      }
    } catch (err) {
      console.error(err);
      dispatch({ type: DEV_EMAILS_FAILED });
    }
  };
