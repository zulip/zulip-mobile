/* @flow */
import type {
  AccountSwitchAction,
  RealmAddAction,
  AccountRemoveAction,
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

export const switchAccount = (index: number): AccountSwitchAction => ({
  type: ACCOUNT_SWITCH,
  index,
});

export const realmAdd = (realm: string, realmIcon: string): RealmAddAction => ({
  type: REALM_ADD,
  realm,
  realmIcon,
});

export const removeAccount = (index: number): AccountRemoveAction => ({
  type: ACCOUNT_REMOVE,
  index,
});

export const loginSuccess = (
  realm: string,
  email: string,
  apiKey: string,
  realmIcon: string,
): LoginSuccessAction => ({
  type: LOGIN_SUCCESS,
  realm,
  email,
  apiKey,
  realmIcon,
});

export const logout = (): LogoutAction => ({
  type: LOGOUT,
});
