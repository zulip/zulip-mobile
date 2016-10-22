export const REALM_ADD = 'REALM_ADD';
export const SET_AUTH_TYPE = 'SET_AUTH_TYPE';
export const ACCOUNT_ADD_SUCCEEDED = 'ACCOUNT_ADD_SUCCEEDED';
export const ACCOUNT_REMOVE = 'ACCOUNT_REMOVE';
export const ACCOUNT_SELECT = 'ACCOUNT_SELECT';

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

export const setAuthType = (authType: string) => ({
  type: SET_AUTH_TYPE,
  authType,
});

export const removeAccount = (index: number) => ({
  type: ACCOUNT_REMOVE,
  index,
});

export const selectAccount = (index: number) => ({
  type: ACCOUNT_SELECT,
  index,
});

export const loginSuccess = (realm, email, apiKey) => ({
  type: LOGIN_SUCCESS,
  realm,
  email,
  apiKey,
});

export const logout = () => ({
  type: LOGOUT,
});
