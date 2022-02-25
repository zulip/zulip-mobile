/* @flow strict-local */
import Immutable from 'immutable';

import type { UserStatusUpdate, ReactionType } from '../api/modelTypes';
import { makeUserId, type UserId } from '../api/idTypes';
import objectEntries from '../utils/objectEntries';
import type { PerAccountApplicableAction, PerAccountState } from '../types';
import type { UserStatusesState, UserStatus } from './userStatusesModelTypes';
import {
  LOGOUT,
  LOGIN_SUCCESS,
  ACCOUNT_SWITCH,
  REGISTER_COMPLETE,
  EVENT_USER_REMOVE,
  EVENT_USER_STATUS_UPDATE,
} from '../actionConstants';

/**
 * The canonical default, "unset" user status.
 *
 * This is the user-status you have if you've just created your account and
 * never interacted with the feature.
 *
 * It's effectively the user-status you have if you're on an old server that
 * doesn't support user statuses.
 *
 * See the corresponding "zero status" in the API described at
 * InitialDataUserStatus.
 */
// TODO(server-2.0): Simplify jsdoc.
// PRIVATE: Exported only for tests.
export const kUserStatusZero: UserStatus = {
  away: false,
  status_text: null,
  status_emoji: null,
};

//
//
// Selectors.
//

export const getUserStatuses = (state: PerAccountState): UserStatusesState => state.userStatuses;

//
//
// Getters.
//

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

/**
 * The status emoji for the given UserId, or `null` if not set.
 */
export const getUserStatusEmoji = (
  state: PerAccountState,
  userId: UserId,
): {| +emoji_name: string, +emoji_code: string, +reaction_type: ReactionType |} | null =>
  getUserStatus(state, userId).status_emoji;

//
//
// Reducer.
//

const initialState: UserStatusesState = Immutable.Map();

function updateUserStatus(
  status: UserStatus,
  update: $ReadOnly<{ ...UserStatusUpdate, ... }>,
): UserStatus {
  const { away, status_text, emoji_name, emoji_code, reaction_type } = update;
  return {
    away: away ?? status.away,
    status_text:
      status_text != null ? (status_text === '' ? null : status_text) : status.status_text,
    status_emoji:
      emoji_name != null && emoji_code != null && reaction_type != null
        ? emoji_name === '' || emoji_code === '' || reaction_type === ''
          ? null
          : { emoji_name, reaction_type, emoji_code }
        : status.status_emoji,
  };
}

export const reducer = (
  state: UserStatusesState = initialState,
  action: PerAccountApplicableAction,
): UserStatusesState => {
  switch (action.type) {
    case LOGOUT:
    case LOGIN_SUCCESS:
    case ACCOUNT_SWITCH:
      return initialState;

    case REGISTER_COMPLETE: {
      const { user_status } = action.data;
      if (!user_status) {
        // TODO(server-2.0): Drop this.
        return initialState;
      }

      return Immutable.Map(
        objectEntries(user_status).map(([id, update]) => [
          makeUserId(Number.parseInt(id, 10)),
          updateUserStatus(kUserStatusZero, update),
        ]),
      );
    }

    case EVENT_USER_STATUS_UPDATE: {
      const oldUserStatus = state.get(action.user_id, kUserStatusZero);
      return state.set(action.user_id, updateUserStatus(oldUserStatus, action));
    }

    case EVENT_USER_REMOVE: // TODO(#3408) handle this
      return state;

    default:
      return state;
  }
};
