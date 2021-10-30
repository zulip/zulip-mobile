/* @flow strict-local */
import * as NavigationService from '../nav/NavigationService';
import type { PerAccountAction, AllAccountsAction, ThunkAction, GlobalThunkAction } from '../types';
import {
  ACCOUNT_SWITCH,
  ACCOUNT_REMOVE,
  LOGIN_SUCCESS,
  LOGOUT,
  DISMISS_SERVER_PUSH_SETUP_NOTICE,
} from '../actionConstants';
import { resetToAccountPicker, resetToMainTabs } from '../nav/navActions';

export const dismissServerPushSetupNotice = (): PerAccountAction => ({
  type: DISMISS_SERVER_PUSH_SETUP_NOTICE,

  // We don't compute this in a reducer function. Those should be pure
  // functions of their params:
  //   https://redux.js.org/tutorials/fundamentals/part-3-state-actions-reducers#rules-of-reducers
  date: new Date(),
});

const accountSwitchPlain = (index: number): AllAccountsAction => ({
  type: ACCOUNT_SWITCH,
  index,
});

export const accountSwitch = (index: number): GlobalThunkAction<void> => (dispatch, getState) => {
  NavigationService.dispatch(resetToMainTabs());
  dispatch(accountSwitchPlain(index));
};

export const removeAccount = (index: number): AllAccountsAction => ({
  type: ACCOUNT_REMOVE,
  index,
});

const loginSuccessPlain = (realm: URL, email: string, apiKey: string): AllAccountsAction => ({
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

const logoutPlain = (): AllAccountsAction => ({
  type: LOGOUT,
});

export const logout = (): ThunkAction<Promise<void>> => async (dispatch, getState) => {
  NavigationService.dispatch(resetToAccountPicker());
  dispatch(logoutPlain());
};
