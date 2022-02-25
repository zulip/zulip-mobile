/* @flow strict-local */
import type { PerAccountState, UserId, UserStatus } from '../types';
import { getUserStatuses } from '../directSelectors';
import { kUserStatusZero } from './userStatusesModel';

/**
 * The `UserStatus` object for the given UserId.
 */
export const getUserStatus = (state: PerAccountState, userId: UserId): UserStatus =>
  getUserStatuses(state).get(userId, kUserStatusZero);
