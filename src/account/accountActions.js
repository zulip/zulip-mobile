/* @flow strict-local */
import type { Action, Dispatch, GetState } from '../types';
import {
  ACCOUNT_SWITCH,
  REALM_ADD,
  ACCOUNT_REMOVE,
  LOGIN_SUCCESS,
  LOGOUT,
} from '../actionConstants';
import { resetToAccountPicker } from '../nav/navActions';
import type { ZulipVersion } from '../utils/zulipVersion';

export const accountSwitch = (index: number): Action => ({
  type: ACCOUNT_SWITCH,
  index,
});

export const realmAdd = (
  realm: URL,
  zulipFeatureLevel: number,
  zulipVersion: ZulipVersion,
): Action => ({
  type: REALM_ADD,
  realm,
  zulipFeatureLevel,
  zulipVersion,
});

export const removeAccount = (index: number): Action => ({
  type: ACCOUNT_REMOVE,
  index,
});

export const loginSuccess = (realm: URL, email: string, apiKey: string): Action => ({
  type: LOGIN_SUCCESS,
  realm,
  email,
  apiKey,
});

const logoutPlain = (): Action => ({
  type: LOGOUT,
});

export const logout = () => async (dispatch: Dispatch, getState: GetState) => {
  dispatch(resetToAccountPicker());
  dispatch(logoutPlain());
};
