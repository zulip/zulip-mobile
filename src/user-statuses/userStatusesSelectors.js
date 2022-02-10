/* @flow strict-local */
import type { PerAccountState, UserId, UserStatus } from '../types';
import { getUserStatuses } from '../directSelectors';
import { kUserStatusZero } from './userStatusesReducer';

/**
 * The `UserStatus` object for the given UserId.
 */
export const getUserStatus = (state: PerAccountState, userId: UserId): UserStatus =>
  getUserStatuses(state).get(userId, kUserStatusZero);

/**
 * The `away` status for the given UserId.
 */
export const getUserStatusAway = (state: PerAccountState, userId: UserId): boolean =>
  getUserStatus(state, userId).away;

/**
 * The status text for the given UserId, or `null` if not set.
 */
export const getUserStatusText = (state: PerAccountState, userId: UserId): string | null =>
  getUserStatus(state, userId).status_text;
