/* @flow strict-local */
import { createSelector } from 'reselect';

import type { GlobalState, Selector, UserStatus } from '../types';
import { getUserStatus } from '../directSelectors';
import { getSelfUserDetail, getUsersByEmail } from '../users/userSelectors';

/**
 * Extract the user status object for the logged in user.
 * If no away status and status text have been set we do not have any data thus `undefined`.
 */
export const getSelfUserStatus: Selector<?UserStatus> = (state: GlobalState) => {
  const userStatus = getUserStatus(state);
  const selfUserDetail = getSelfUserDetail(state);
  return userStatus[selfUserDetail.user_id];
};

/**
 * Returns the effective `away` status of the logged in user.
 * It is `true` if explicitly set to that value.
 * If no value is set we consider it `false`.
 */
export const getSelfUserAwayStatus = (state: GlobalState): boolean => {
  const selfUserStatus = getSelfUserStatus(state);
  return !!(selfUserStatus && selfUserStatus.away);
};

/**
 * Returns the effective `status text` value of the logged in user.
 * If it is set we get as result that value.
 * If no value is set we get a valid but empty string.
 */
export const getSelfUserStatusText = (state: GlobalState): string => {
  const selfUserStatus = getSelfUserStatus(state);
  return (selfUserStatus && selfUserStatus.status_text) || '';
};

export const getUserStatusByEmail: Selector<UserStatus | void, string> = createSelector(
  (state, email) => email,
  state => getUserStatus(state),
  state => getUsersByEmail(state),
  (email, userStatus, users) => {
    const user = users.get(email);
    if (!user) {
      return undefined;
    }
    return userStatus[user.user_id];
  },
);
