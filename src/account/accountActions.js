import { getAuthBackends, fetchApiKey, devFetchApiKey, devGetEmails } from '../api/apiClient';

export const ACCOUNT_ADD_PENDING = 'ACCOUNT_ADD_PENDING';
export const ACCOUNT_ADD_SUCCEEDED = 'ACCOUNT_ADD_SUCCEEDED';
export const ACCOUNT_ADD_FAILED = 'ACCOUNT_ADD_FAILED';
export const ACCOUNT_REMOVE = 'ACCOUNT_REMOVE';

export const LOGIN_PENDING = 'LOGIN_PENDING';
export const LOGIN_SUCCEEDED = 'LOGIN_SUCCEEDED';
export const LOGIN_FAILED = 'LOGIN_FAILED';
export const LOGIN_TIMED_OUT = 'LOGIN_TIMED_OUT';
export const LOGOUT = 'LOGOUT';

export const DEV_EMAILS_PENDING = 'DEV_EMAILS_PENDING';
export const DEV_EMAILS_SUCCEEDED = 'DEV_EMAILS_SUCCEEDED';
export const DEV_EMAILS_FAILED = 'DEV_EMAILS_FAILED';

export const addAccount = (realm) =>
  async (dispatch) => {
    dispatch({ type: ACCOUNT_ADD_PENDING });

    try {
      const authBackends = await getAuthBackends({ realm });

      dispatch({
        type: ACCOUNT_ADD_SUCCEEDED,
        realm,
        authBackends,
      });
    } catch (err) {
      dispatch({ type: ACCOUNT_ADD_FAILED, error: err.message });
    }
  };

export const attemptLogin = (auth, email, password) =>
  async (dispatch) => {
    // Tell the UI to display a spinner
    dispatch({ type: LOGIN_PENDING });

    try {
      const apiKey = await fetchApiKey(auth, email, password);

      dispatch({
        type: LOGIN_SUCCEEDED,
        apiKey,
        email,
      });
    } catch (err) {
      dispatch({ type: LOGIN_FAILED, auth, error: err.message });
    }
  };

export const attemptDevLogin = (auth, email) =>
  async (dispatch) => {
    // Tell the UI to display a spinner
    dispatch({ type: LOGIN_PENDING });

    try {
      const apiKey = await devFetchApiKey(auth, email);

      dispatch({
        type: LOGIN_SUCCEEDED,
        activeBackend: 'dev',
        email,
        apiKey,
      });
    } catch (err) {
      dispatch({ type: LOGIN_FAILED, auth, error: err.message });
    }
  };

export const getDevEmails = (auth) =>
  async (dispatch) => {
    dispatch({ type: DEV_EMAILS_PENDING });

    try {
      const [directAdmins, directUsers] = await devGetEmails(auth);

      dispatch({
        type: DEV_EMAILS_SUCCEEDED,
        auth,
        activeBackend: 'dev',
        directUsers,
        directAdmins,
      });
    } catch (err) {
      dispatch({ type: DEV_EMAILS_FAILED, error: err.message });
    }
  };

export const logout = () =>
  async (dispatch) =>
    dispatch({ type: LOGOUT });
