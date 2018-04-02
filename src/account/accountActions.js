/* @flow */
import type {
  SwitchAccountAction,
  RealmAddAction,
  RemoveAccountAction,
  LoginSuccessAction,
  LogoutAction,
} from '../types';
import {
  ACCOUNT_SWITCH,
  REALM_ADD,
  ACCOUNT_REMOVE,
  LOGIN_SUCCESS,
  LOGOUT,
} from '../actionConstants';

export const switchAccount = (index: number): SwitchAccountAction => ({
  type: ACCOUNT_SWITCH,
  index,
});

export const realmAdd = (realm: string): RealmAddAction => ({
  type: REALM_ADD,
  realm,
});

export const removeAccount = (index: number): RemoveAccountAction => ({
  type: ACCOUNT_REMOVE,
  index,
});

export const loginSuccess = (realm: string, email: string, apiKey: string): LoginSuccessAction => ({
  type: LOGIN_SUCCESS,
  realm,
  email,
  apiKey,
});

export const logout = (): LogoutAction => ({
  type: LOGOUT,
});
