/* @flow strict-local */
import type { ThunkAction } from '../types';
import * as api from '../api';
import { getAuth } from '../selectors';

export const updateUserAwayStatus = (away: boolean): ThunkAction<Promise<void>> => async (
  dispatch,
  getState,
) => {
  const auth = getAuth(getState());
  api.updateUserStatus(auth, { away });
};

export const updateUserStatusText = (statusText: string): ThunkAction<Promise<void>> => async (
  dispatch,
  getState,
) => {
  const auth = getAuth(getState());
  api.updateUserStatus(auth, { status_text: statusText });
};
