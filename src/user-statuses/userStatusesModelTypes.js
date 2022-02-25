/* @flow strict-local */
import type Immutable from 'immutable';

import type { UserId } from '../api/idTypes';
import type { ReactionType } from '../api/modelTypes';

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
 * The user status of each user.
 *
 * Users who have the "zero" status, `kUserStatusZero`, may be represented
 * implicitly by having no record in this map.
 */
export type UserStatusesState = Immutable.Map<UserId, UserStatus>;
