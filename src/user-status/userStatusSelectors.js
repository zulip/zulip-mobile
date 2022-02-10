/* @flow strict-local */
import type { PerAccountState, Selector, UserId, UserStatus } from '../types';
import { getUserStatus } from '../directSelectors';
import { getOwnUserId } from '../users/userSelectors';
import { kUserStatusZero } from './userStatusReducer';

/**
 * The `UserStatus` object for the given UserId.
 */
export const getUserStatusForUser = (state: PerAccountState, userId: UserId): UserStatus =>
  getUserStatus(state).get(userId, kUserStatusZero);

/**
 * The `UserStatus` object for the self-user.
 */
export const getSelfUserStatus: Selector<UserStatus> = (state: PerAccountState) =>
  getUserStatusForUser(state, getOwnUserId(state));

/**
 * The `away` status of the self-user.
 */
export const getSelfUserAwayStatus = (state: PerAccountState): boolean =>
  getSelfUserStatus(state).away;

/**
 * The status text of the self-user, or `null` if not set.
 */
export const getSelfUserStatusText = (state: PerAccountState): string | null =>
  getSelfUserStatus(state).status_text;

/**
 * The status text for the given UserId, or `null` if not set.
 */
export const getUserStatusText = (state: PerAccountState, userId: UserId): string | null =>
  getUserStatusForUser(state, userId).status_text;
