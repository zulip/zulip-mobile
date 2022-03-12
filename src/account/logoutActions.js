/* @flow strict-local */
import * as NavigationService from '../nav/NavigationService';
import type { AllAccountsAction, ThunkAction } from '../types';
import { LOGOUT } from '../actionConstants';
import { resetToAccountPicker } from '../nav/navActions';

const logoutPlain = (): AllAccountsAction => ({
  type: LOGOUT,
});

/**
 * Forget this user's API key and erase their content.
 */
// In its own file just to prevent import cycles.
export const logout = (): ThunkAction<Promise<void>> => async (dispatch, getState) => {
  NavigationService.dispatch(resetToAccountPicker());
  dispatch(logoutPlain());
};
