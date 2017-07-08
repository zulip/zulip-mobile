/* @flow */
import type { Action } from '../types';
import {
  ACCOUNT_SWITCH,
  REALM_ADD,
  SET_AUTH_TYPE,
  ACCOUNT_REMOVE,
  LOGIN_SUCCESS,
  LOGOUT,
} from '../actionConstants';

export const switchAccount = (index: number): Action => ({
  type: ACCOUNT_SWITCH,
  index,
});

export const realmAdd = (realm: string): Action => ({
  type: REALM_ADD,
  realm,
});

export const setAuthType = (authType: string): Action => ({
  type: SET_AUTH_TYPE,
  authType,
});

export const removeAccount = (index: number): Action => ({
  type: ACCOUNT_REMOVE,
  index,
});

export const loginSuccess = (realm: string, email: string, apiKey: string): Action => ({
  type: LOGIN_SUCCESS,
  realm,
  email,
  apiKey,
});

export const logout = (): Action => ({
  type: LOGOUT,
});
