import {
  REALM_ADD,
  SET_AUTH_TYPE,
  ACCOUNT_REMOVE,
  ACCOUNT_SELECT,
  LOGIN_SUCCESS,
  LOGOUT,
} from '../constants';

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
