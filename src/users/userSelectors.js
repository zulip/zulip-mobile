/* @flow strict-local */
import { createSelector } from 'reselect';

import type {
  CustomProfileField,
  PerAccountState,
  UserOrBot,
  Selector,
  User,
  UserId,
} from '../types';
import type { RealmState } from '../reduxTypes';
import { getUsers, getCrossRealmBots, getNonActiveUsers } from '../directSelectors';
import * as logging from '../utils/logging';
import { ensureUnreachable } from '../generics';

/**
 * All users in this Zulip org (aka realm).
 *
 * In particular this includes:
 *  * cross-realm bots
 *  * deactivated users (`is_active` false; see `User` and the linked docs)
 *
 * This is the right list to use in any UI context that might involve things
 * a user did in the past: messages they sent, reactions they added, etc.
 * Deactivating a user means they can't log in and see or send new messages,
 * and doesn't erase them from history.
 *
 * In contexts that are about offering *new* interactions -- like choosing a
 * user to send a PM to -- deactivated users should be left out.
 *
 * See:
 *  * `getActiveUsersById` for leaving out deactivated users
 *  * `User` for details on properties, and links to docs.
 */
const getAllUsers: Selector<$ReadOnlyArray<UserOrBot>> = createSelector(
  getUsers,
  getNonActiveUsers,
  getCrossRealmBots,
  (users = [], nonActiveUsers = [], crossRealmBots = []) => [
    ...users,
    ...nonActiveUsers,
    ...crossRealmBots,
  ],
);

/** See `getAllUsers` for discussion. */
export const getAllUsersById: Selector<Map<UserId, UserOrBot>> = createSelector(
  getAllUsers,
  allUsers => new Map(allUsers.map(user => [user.user_id, user])),
);

/**
 * See `getAllUsers` for discussion.
 *
 * Prefer `getAllUsersById`; see #3764.
 *
 */
export const getAllUsersByEmail: Selector<Map<string, UserOrBot>> = createSelector(
  getAllUsers,
  allUsers => new Map(allUsers.map(user => [user.email, user])),
);

/**
 * PRIVATE; exported only for tests.
 *
 * WARNING: despite the name, only (a) `is_active` users (b) excluding cross-realm bots.
 *
 * See `getAllUsersById`, and `getAllUsers` for discussion.
 */
export const getUsersById: Selector<Map<UserId, User>> = createSelector(
  getUsers,
  (users = []) => new Map(users.map(user => [user.user_id, user])),
);

/**
 * WARNING: despite the name, only (a) `is_active` users (b) excluding cross-realm bots.
 *
 * See `getAllUsers`.
 */
export const getSortedUsers: Selector<$ReadOnlyArray<User>> = createSelector(getUsers, users =>
  [...users].sort((x1, x2) => x1.full_name.toLowerCase().localeCompare(x2.full_name.toLowerCase())),
);

/**
 * The user's own user ID in the active account.
 *
 * Throws if we have no data from the server.
 *
 * See also `getOwnUser`.
 */
export const getOwnUserId = (state: PerAccountState): UserId => {
  const { user_id } = state.realm;
  if (user_id === undefined) {
    throw new Error('No server data found');
  }
  return user_id;
};

/**
 * The person using the app, as represented by a `User` object.
 *
 * This is the server's information about the active, logged-in account, in
 * the same form as the information we get from the server about everyone
 * else in the organization.
 *
 * Throws if we have no such information.
 *
 * See also `getOwnUserId`.
 */
export const getOwnUser = (state: PerAccountState): User => {
  const ownUser = getUsersById(state).get(getOwnUserId(state));
  if (ownUser === undefined) {
    throw new Error('Have ownUserId, but not found in user data');
  }
  return ownUser;
};

/**
 * The user with the given user ID, or null if no such user is known.
 *
 * This works for any user in this Zulip org/realm, including deactivated
 * users and cross-realm bots.  See `getAllUsers` for details.
 *
 * See `getUserForId` for a version which only ever returns a real user,
 * throwing if none.  That makes it a bit simpler to use in contexts where
 * we assume the relevant user must exist, which is true of most of the app.
 */
export const tryGetUserForId = (state: PerAccountState, userId: UserId): UserOrBot | null =>
  getAllUsersById(state).get(userId) ?? null;

/**
 * The user with the given user ID.
 *
 * This works for any user in this Zulip org/realm, including deactivated
 * users and cross-realm bots.  See `getAllUsers` for details.
 *
 * Throws if no such user exists.
 *
 * See `tryGetUserForId` for a non-throwing version.
 */
export const getUserForId = (state: PerAccountState, userId: UserId): UserOrBot => {
  const user = tryGetUserForId(state, userId);
  if (!user) {
    throw new Error(`getUserForId: missing user: id ${userId}`);
  }
  return user;
};

/**
 * DEPRECATED except as a cache private to this module.
 *
 * Excludes deactivated users.  See `getAllUsers` for discussion.
 *
 * Instead of this selector, use:
 *  * `getAllUsersById` for data on an arbitrary user
 *  * `getUserIsActive` for the specific information of whether a user is
 *    deactivated.
 */
const getActiveUsersById: Selector<Map<UserId, UserOrBot>> = createSelector(
  getUsers,
  getCrossRealmBots,
  (users = [], crossRealmBots = []) =>
    new Map([...users, ...crossRealmBots].map(user => [user.user_id, user])),
);

/**
 * The value of `is_active` for the given user.
 *
 * For a normal user, this is true unless the user or an admin has
 * deactivated their account.  The name comes from Django; this property
 * isn't related to presence or to whether the user has recently used Zulip.
 *
 * (Conceptually this should be a property on the `User` object; the reason
 * it isn't is just that the Zulip API presents this information in a funny
 * other way.)
 */
// To understand this implementation, see the comment about `is_active` in
// the `User` type definition.
export const getUserIsActive = (state: PerAccountState, userId: UserId): boolean =>
  !!getActiveUsersById(state).get(userId);

/** A user's value for a custom profile field, put into meaningful form. */
export type CustomProfileFieldValue =
  | { +displayType: 'text', +text: string }
  | { +displayType: 'link', +text: string, +url: void | URL }
  | { +displayType: 'users', +userIds: $ReadOnlyArray<UserId> };

function interpretCustomProfileField(
  realmDefaultExternalAccounts: $ElementType<RealmState, 'defaultExternalAccounts'>,
  realmField: CustomProfileField,
  profileData: $ElementType<UserOrBot, 'profile_data'>,
): void | CustomProfileFieldValue {
  const userFieldData = profileData?.[realmField.id.toString()];
  if (!userFieldData) {
    return undefined;
  }

  const { value } = userFieldData;
  const { type } = realmField;
  switch (type) {
    // In general this part of the API is not documented up to Zulip's
    // normal standards.  Some discussion here:
    //   https://chat.zulip.org/#narrow/stream/378-api-design/topic/custom.20profile.20fields/near/1387379

    case 1: // CustomProfileFieldType.ShortText
    case 2: // CustomProfileFieldType.LongText
      // The web client appears to treat these two cases identically.
      // So we do the same.
      return { displayType: 'text', text: value };

    case 3: {
      // CustomProfileFieldType.Choice
      // TODO(server): This isn't really documented.  But see chat thread:
      //   https://chat.zulip.org/#narrow/stream/378-api-design/topic/custom.20profile.20fields/near/1383005
      const choices = JSON.parse(realmField.field_data);
      return { displayType: 'text', text: choices[value].text };
    }

    case 4: {
      // CustomProfileFieldType.Date
      // TODO(server): The value's format is undocumented, but empirically
      //   it's a date in ISO format, like 2000-01-01.
      // That's readable as is, but:
      // TODO format this date using user's locale.
      return { displayType: 'text', text: value };
    }

    case 5: // CustomProfileFieldType.Link
      // This isn't real clearly documented; but the `value` is just the URL.
      return { displayType: 'link', text: value, url: new URL(value) };

    case 7: {
      // CustomProfileFieldType.ExternalAccount
      // TODO(server): This is undocumented.  See chat thread:
      //   https://chat.zulip.org/#narrow/stream/378-api-design/topic/external.20account.20custom.20profile.20fields/near/1387213
      const realmData: { subtype: string, url_pattern?: string } = JSON.parse(
        realmField.field_data,
      );
      const { subtype, url_pattern } = realmData;
      const pattern = url_pattern ?? realmDefaultExternalAccounts.get(subtype)?.url_pattern;
      const url = pattern == null ? undefined : new URL(pattern.replace('%(username)s', value));
      if (!url) {
        logging.warn(
          `Missing url_pattern for custom profile field of type ExternalAccount, subtype '${subtype}'`,
        );
      }
      return { displayType: 'link', text: value, url };
    }

    case 6: {
      // CustomProfileFieldType.User
      // TODO(server): This is completely undocumented.  The key to
      //   reverse-engineering it was:
      //   https://github.com/zulip/zulip/blob/18230fcd9/static/js/settings_account.js#L247
      const userIds: $ReadOnlyArray<UserId> = JSON.parse(value);
      return { displayType: 'users', userIds };
    }

    default:
      ensureUnreachable(type);
      logging.warn(`Invalid custom profile field type: ${type}`);
      return undefined;
  }
}

/**
 * The given user's values for custom profile fields, interpreted to make usable.
 *
 * These are in the order a client is expected to present them in.  Any
 * fields that are configured on the realm but that the user has no chosen
 * value for are omitted.
 *
 * This selector does no caching.  Meant for use inside `React.useMemo`.
 */
export function getCustomProfileFieldsForUser(
  realm: RealmState,
  user: UserOrBot,
): Array<{| +fieldId: number, +name: string, +value: CustomProfileFieldValue |}> {
  const realmFields = realm.customProfileFields;
  const realmDefaultExternalAccounts = realm.defaultExternalAccounts;

  // TODO(server): The realm-wide field objects have an `order` property,
  //   but the actual API appears to be that the fields should be shown in
  //   the order they appear in the array (`custom_profile_fields` in the
  //   API; our `realmFields` array here.)  See chat thread:
  //     https://chat.zulip.org/#narrow/stream/378-api-design/topic/custom.20profile.20fields/near/1382982
  const fields = []; // eslint-disable-line no-shadow
  for (const realmField of realmFields) {
    const value = interpretCustomProfileField(
      realmDefaultExternalAccounts,
      realmField,
      user.profile_data,
    );
    if (value) {
      fields.push({ name: realmField.name, fieldId: realmField.id, value });
    }
  }
  return fields;
}
