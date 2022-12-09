/* @flow strict-local */
import * as NavigationService from '../nav/NavigationService';
import type { PerAccountAction, AllAccountsAction, ThunkAction } from '../types';
import { LOGOUT, RESET_ACCOUNT_DATA } from '../actionConstants';
import { resetToAccountPicker } from '../nav/navActions';

/**
 * Reset per-account server data and some client-side data (drafts/outbox).
 */
// In this file just to prevent import cycles.
export const resetAccountData = (): PerAccountAction => ({
  type: RESET_ACCOUNT_DATA,
});

const logoutPlain = (): AllAccountsAction => ({
  type: LOGOUT,
});

/**
 * Forget this user's API key and erase their content.
 */
// In its own file just to prevent import cycles.
export const logout = (): ThunkAction<Promise<void>> => async (dispatch, getState) => {
  NavigationService.dispatch(resetToAccountPicker());
  dispatch(resetAccountData());
  dispatch(logoutPlain());
};
