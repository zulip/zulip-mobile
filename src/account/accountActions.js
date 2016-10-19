import { fetchApiKey, devFetchApiKey, devGetEmails } from '../api/apiClient';

export const REALM_ADD = 'REALM_ADD';
export const ACCOUNT_ADD_SUCCEEDED = 'ACCOUNT_ADD_SUCCEEDED';
export const ACCOUNT_REMOVE = 'ACCOUNT_REMOVE';

export const LOGIN_PENDING = 'LOGIN_PENDING';
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const LOGIN_FAILED = 'LOGIN_FAILED';
export const LOGIN_TIMED_OUT = 'LOGIN_TIMED_OUT';
export const LOGOUT = 'LOGOUT';

export const DEV_EMAILS_PENDING = 'DEV_EMAILS_PENDING';
export const DEV_EMAILS_SUCCEEDED = 'DEV_EMAILS_SUCCEEDED';
export const DEV_EMAILS_FAILED = 'DEV_EMAILS_FAILED';

export const realmAdd = (realm: string) => ({
  type: REALM_ADD,
  realm,
});

export const removeAccount = (index: number) => ({
  type: ACCOUNT_REMOVE,
  index,
});

export const loginSuccess = (realm, email, apiKey) => ({
  type: LOGIN_SUCCESS,
  realm,
  email,
  apiKey,
});

export const attemptLogin = (auth, email, password) =>
  async (dispatch) => {
    dispatch({ type: LOGIN_PENDING });

    try {
      const apiKey = await fetchApiKey(auth, email, password);

      dispatch({
        type: LOGIN_SUCCESS,
        apiKey,
        email,
      });
    } catch (err) {
      dispatch({ type: LOGIN_FAILED, auth, error: err.message });
    }
  };

export const attemptDevLogin = (auth, email) =>
  async (dispatch) => {
    dispatch({ type: LOGIN_PENDING });

    try {
      const apiKey = await devFetchApiKey(auth, email);

      dispatch({
        type: LOGIN_SUCCESS,
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

export const logout = () => ({
  type: LOGOUT,
});
