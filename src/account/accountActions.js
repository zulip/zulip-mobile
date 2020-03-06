/* @flow strict-local */
import type { Action } from '../types';
import {
  ACCOUNT_SWITCH,
  REALM_ADD,
  ACCOUNT_REMOVE,
  LOGIN_SUCCESS,
  LOGOUT,
} from '../actionConstants';
import type { ZulipVersion } from '../utils/zulipVersion';

export const switchAccount = (index: number): Action => ({
  type: ACCOUNT_SWITCH,
  index,
});

export const realmAdd = (realm: string, zulipVersion: ZulipVersion): Action => ({
  type: REALM_ADD,
  realm,
  zulipVersion,
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
