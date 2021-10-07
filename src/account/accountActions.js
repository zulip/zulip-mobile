/* @flow strict-local */
import * as NavigationService from '../nav/NavigationService';
import type { Action, ThunkAction } from '../types';
import { ACCOUNT_SWITCH, ACCOUNT_REMOVE, LOGIN_SUCCESS, LOGOUT } from '../actionConstants';
import { resetToAccountPicker, resetToMainTabs } from '../nav/navActions';
import * as api from '../api';
import { getAuth } from '../selectors';
import * as logging from '../utils/logging';
import { showToast } from '../utils/info';

const accountSwitchPlain = (index: number): Action => ({
  type: ACCOUNT_SWITCH,
  index,
});

export const accountSwitch = (index: number): ThunkAction<void> => (dispatch, getState) => {
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

export const deactivateUser = () => async (dispatch: Dispatch, getState: GetState) => {
  const auth = getAuth(getState());

  try {
    await api.deactivateUser(auth);
  } catch (error) {
    logging.error('Error deactivating account', error);
    showToast(`${error}`);
  }
};
