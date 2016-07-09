import ApiClient from '../api/ApiClient.js';

export const ACCOUNT_ADD_PENDING = 'ACCOUNT_ADD_PENDING';
export const ACCOUNT_ADD_SUCCEEDED = 'ACCOUNT_ADD_SUCCEEDED';
export const ACCOUNT_ADD_FAILED = 'ACCOUNT_ADD_FAILED';

export const LOGIN_PENDING = 'LOGIN_PENDING';
export const LOGIN_SUCCEEDED = 'LOGIN_SUCCEEDED';
export const LOGIN_FAILED = 'LOGIN_FAILED';
export const LOGIN_TIMED_OUT = 'LOGIN_TIMED_OUT';

export const DEV_EMAILS_PENDING = 'DEV_EMAILS_PENDING';
export const DEV_EMAILS_SUCCEEDED = 'DEV_EMAILS_SUCCEEDED';
export const DEV_EMAILS_FAILED = 'DEV_EMAILS_FAILED';

export const addAccount = (realm) =>
  async (dispatch) => {
    // Tell the UI to display a spinner
    dispatch({ type: ACCOUNT_ADD_PENDING });

    try {
      const authBackends = await ApiClient.getAuthBackends({
        realm,
        loggedIn: false,
      });

      dispatch({
        type: ACCOUNT_ADD_SUCCEEDED,
        realm,
        authBackends,
      });
    } catch (err) {
      dispatch({ type: ACCOUNT_ADD_FAILED, error: err.message });
    }
  };

export const attemptLogin = (account, email, password) =>
  async (dispatch) => {
    // Tell the UI to display a spinner
    dispatch({ type: LOGIN_PENDING });

    try {
      const apiKey = await ApiClient.fetchApiKey(account, email, password);

      dispatch({
        type: LOGIN_SUCCEEDED,
        account,
        activeBackend: 'password',
        email,
        apiKey,
      });
    } catch (err) {
      dispatch({ type: LOGIN_FAILED, account, error: err.message });
    }
  };

export const attemptDevLogin = (account, email) =>
  async (dispatch) => {
    // Tell the UI to display a spinner
    dispatch({ type: LOGIN_PENDING });

    try {
      const apiKey = await ApiClient.devFetchApiKey(account, email);

      dispatch({
        type: LOGIN_SUCCEEDED,
        account,
        activeBackend: 'dev',
        email,
        apiKey,
      });
    } catch (err) {
      dispatch({ type: LOGIN_FAILED, account, error: err.message });
    }
  };

export const getDevEmails = (account) =>
  async (dispatch) => {
    dispatch({ type: DEV_EMAILS_PENDING });

    try {
      const [directAdmins, directUsers] = await ApiClient.devGetEmails(account);

      dispatch({
        type: DEV_EMAILS_SUCCEEDED,
        account,
        activeBackend: 'dev',
        directUsers,
        directAdmins,
      });
    } catch (err) {
      dispatch({ type: DEV_EMAILS_FAILED, error: err.message });
    }
  };
