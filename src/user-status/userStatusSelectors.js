/* @flow strict-local */
import type { GlobalState, Selector, UserId, UserStatus } from '../types';
import { getUserStatus } from '../directSelectors';
import { getOwnUserId } from '../users/userSelectors';

/**
 * Extract the user status object for the logged in user.
 * If no away status and status text have been set we do not have any data thus `undefined`.
 */
export const getSelfUserStatus: Selector<?UserStatus> = (state: GlobalState) => {
  const userStatus = getUserStatus(state);
  return userStatus[getOwnUserId(state)];
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

/**
 * Returns the `status text` value of the user with the given userId.
 * We return `undefined` if no value is set.
 */
export const getUserStatusTextForUser = (state: GlobalState, userId: UserId): string | void => {
  const userStatus = getUserStatus(state);
  return userStatus[userId] && userStatus[userId].status_text;
};
