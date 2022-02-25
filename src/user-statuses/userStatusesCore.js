/**
 * The core of the user-status model, without dependencies on other models.
 *
 * @flow strict-local
 */
import Immutable from 'immutable';

import type { ReactionType, UserId } from '../api/apiTypes';

/**
 * A user's chosen availability and text/emoji statuses.
 */
export type UserStatus = $ReadOnly<{|
  // true/false: User unavailable/available.
  away: boolean,

  // "foo": User's status text is "foo".
  // null: User's status text is unset.
  status_text: string | null,

  // null: User's status emoji is unset.
  status_emoji: null | {|
    // These three properties point to an emoji in the same way the same-named
    // properties point to an emoji in the Reaction type; see there.
    +emoji_name: string,
    +reaction_type: ReactionType,
    +emoji_code: string,
  |},
|}>;

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
// PRIVATE: Only to be used in this model's code.
export const kUserStatusZero: UserStatus = {
  away: false,
  status_text: null,
  status_emoji: null,
};

/**
 * The user status of each user.
 *
 * Users who have the "zero" status, `kUserStatusZero`, may be represented
 * implicitly by having no record in this map.
 */
export type UserStatusesState = Immutable.Map<UserId, UserStatus>;
