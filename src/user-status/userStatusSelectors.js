/* @flow strict-local */
import type { PerAccountState, Selector, UserId, UserStatus } from '../types';
import { getUserStatus } from '../directSelectors';
import { getOwnUserId } from '../users/userSelectors';

/**
 * The `UserStatus` object for the given UserId.
 */
export const getUserStatusForUser = (state: PerAccountState, userId: UserId): UserStatus =>
  // An "unset" UserStatus is an object without status_text / away, which
  //   turns out to be empty.
  //
  // The `Object.freeze` is to work around a Flow issue:
  //   https://github.com/facebook/flow/issues/2386#issuecomment-695064325
  getUserStatus(state).get(userId, Object.freeze({}));

/**
 * Extract the user status object for the logged in user.
 * If no away status and status text have been set we do not have any data thus `undefined`.
 */
export const getSelfUserStatus: Selector<UserStatus> = (state: PerAccountState) =>
  getUserStatusForUser(state, getOwnUserId(state));

/**
 * Returns the effective `away` status of the logged in user.
 * It is `true` if explicitly set to that value.
 * If no value is set we consider it `false`.
 */
export const getSelfUserAwayStatus = (state: PerAccountState): boolean =>
  !!getSelfUserStatus(state).away;

/**
 * Returns the effective `status text` value of the logged in user.
 * If it is set we get as result that value.
 * If no value is set we get a valid but empty string.
 */
export const getSelfUserStatusText = (state: PerAccountState): string | void =>
  getSelfUserStatus(state).status_text;

/**
 * Returns the `status text` value of the user with the given userId.
 * We return `undefined` if no value is set.
 */
export const getUserStatusTextForUser = (state: PerAccountState, userId: UserId): string | void =>
  getUserStatusForUser(state, userId).status_text;
