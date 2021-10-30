/* @flow strict-local */
import * as NavigationService from '../nav/NavigationService';
import type { Action, ThunkAction, GlobalThunkAction } from '../types';
import { ACCOUNT_SWITCH, ACCOUNT_REMOVE, LOGIN_SUCCESS, LOGOUT } from '../actionConstants';
import { resetToAccountPicker, resetToMainTabs } from '../nav/navActions';

const accountSwitchPlain = (index: number): Action => ({
  type: ACCOUNT_SWITCH,
  index,
});

export const accountSwitch = (index: number): GlobalThunkAction<void> => (dispatch, getState) => {
  NavigationService.dispatch(resetToMainTabs());
  dispatch(accountSwitchPlain(index));
};

export const removeAccount = (index: number): Action => ({
  type: ACCOUNT_REMOVE,
  index,
});

const loginSuccessPlain = (realm: URL, email: string, apiKey: string): Action => ({
  type: LOGIN_SUCCESS,
  realm,
  email,
  apiKey,
});

export const loginSuccess = (realm: URL, email: string, apiKey: string): ThunkAction<void> => (
  dispatch,
  getState,
) => {
  NavigationService.dispatch(resetToMainTabs());
  dispatch(loginSuccessPlain(realm, email, apiKey));
};

const logoutPlain = (): Action => ({
  type: LOGOUT,
});

export const logout = (): ThunkAction<Promise<void>> => async (dispatch, getState) => {
  NavigationService.dispatch(resetToAccountPicker());
  dispatch(logoutPlain());
};
