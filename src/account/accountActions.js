/* @flow strict-local */
import * as NavigationService from '../nav/NavigationService';
import type { Action, Dispatch, GetState } from '../types';
import { ACCOUNT_SWITCH, ACCOUNT_REMOVE, LOGIN_SUCCESS, LOGOUT } from '../actionConstants';
import { resetToAccountPicker, resetToMainTabs } from '../nav/navActions';

const accountSwitchPlain = (index: number): Action => ({
  type: ACCOUNT_SWITCH,
  index,
});

export const accountSwitch = (index: number) => (dispatch: Dispatch, getState: GetState) => {
  NavigationService.dispatch(resetToMainTabs());
  dispatch(accountSwitchPlain(index));
};

export const removeAccount = (index: number): Action => ({
  type: ACCOUNT_REMOVE,
  index,
});

const loginSuccessPlain = (realm: URL, email: string, realmIcon: URL, apiKey: string): Action => ({
  type: LOGIN_SUCCESS,
  realm,
  email,
  apiKey,
  realmIcon,
});

export const loginSuccess = (realm: URL, email: string, realmIcon: URL, apiKey: string) => (
  dispatch: Dispatch,
  getState: GetState,
) => {
  NavigationService.dispatch(resetToMainTabs());
  dispatch(loginSuccessPlain(realm, email, realmIcon, apiKey));
};

const logoutPlain = (): Action => ({
  type: LOGOUT,
});

export const logout = () => async (dispatch: Dispatch, getState: GetState) => {
  NavigationService.dispatch(resetToAccountPicker());
  dispatch(logoutPlain());
};
