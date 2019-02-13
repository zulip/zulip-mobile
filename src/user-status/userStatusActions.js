/* @flow strict-local */
import type { Dispatch, GetState } from '../types';
/* eslint-disable import/no-named-as-default-member */
import api from '../api';
import { getAuth, getSelfUserDetail } from '../selectors';
import { OPTIMISTIC_USER_STATUS_UPDATE } from '../actionConstants';

export const updateUserAwayStatus = (away: boolean) => async (
  dispatch: Dispatch,
  getState: GetState,
) => {
  const auth = getAuth(getState());
  api.updateUserStatus(auth, { away });
  const selfUserDetail = getSelfUserDetail(getState());
  dispatch({
    type: OPTIMISTIC_USER_STATUS_UPDATE,
    user_id: selfUserDetail.user_id,
    away,
  });
};

export const updateUserStatusText = (statusText: string) => async (
  dispatch: Dispatch,
  getState: GetState,
) => {
  const auth = getAuth(getState());
  api.updateUserStatus(auth, { status_text: statusText });
};
