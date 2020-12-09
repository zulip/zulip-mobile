/* @flow strict-local */
import { createSelector } from 'reselect';

import type { GlobalState, UserOrBot, Selector, User, UserId } from '../types';
import { NULL_USER } from '../nullObjects';
import { getUsers, getCrossRealmBots, getNonActiveUsers } from '../directSelectors';

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
const getAllUsers: Selector<UserOrBot[]> = createSelector(
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
export const getSortedUsers: Selector<User[]> = createSelector(
  getUsers,
  users =>
    [...users].sort((x1, x2) =>
      x1.full_name.toLowerCase().localeCompare(x2.full_name.toLowerCase()),
    ),
);

/**
 * The user's own user ID in the active account.
 *
 * Throws if we have no data from the server.
 *
 * See also `getOwnEmail` and `getOwnUser`.
 */
// Not currently used, but should replace uses of `getOwnEmail` (e.g. inside
// `getOwnUser`).  See #3764.
export const getOwnUserId = (state: GlobalState): UserId => {
  const { user_id } = state.realm;
  if (user_id === undefined) {
    throw new Error('No server data found');
  }
  return user_id;
};

/**
 * The user's own email in the active account.
 *
 * Throws if we have no data from the server.
 *
 * Prefer using `getOwnUserId` or `getOwnUser`; see #3764.
 */
export const getOwnEmail = (state: GlobalState): string => {
  const { email } = state.realm;
  if (email === undefined) {
    throw new Error('No server data found');
  }
  return email;
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
 * See also `getOwnUserId` and `getOwnEmail`.
 */
export const getOwnUser = (state: GlobalState): User => {
  const ownUser = getUsersById(state).get(getOwnUserId(state));
  if (ownUser === undefined) {
    throw new Error('Have ownUserId, but not found in user data');
  }
  return ownUser;
};

/**
 * DEPRECATED; don't add new uses.  Generally, use `getOwnUser` instead.
 *
 * PRs to eliminate the remaining uses of this are welcome.
 *
 * For discussion, see `nullObjects.js`.
 */
export const getSelfUserDetail = (state: GlobalState): User =>
  getUsersById(state).get(getOwnUserId(state)) || NULL_USER;

/**
 * WARNING: despite the name, only (a) `is_active` users (b) excluding cross-realm bots.
 *
 * See `getAllUsers`.
 */
export const getUsersSansMe: Selector<User[]> = createSelector(
  getUsers,
  getOwnEmail,
  (users, ownEmail) => users.filter(user => user.email !== ownEmail),
);

/** Excludes deactivated users.  See `getAllUsers` for discussion. */
export const getActiveUsersById: Selector<Map<UserId, UserOrBot>> = createSelector(
  getUsers,
  getCrossRealmBots,
  (users = [], crossRealmBots = []) =>
    new Map([...users, ...crossRealmBots].map(user => [user.user_id, user])),
);

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
export const tryGetUserForId = (state: GlobalState, userId: UserId): UserOrBot | null =>
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
export const getUserForId = (state: GlobalState, userId: UserId): UserOrBot => {
  const user = tryGetUserForId(state, userId);
  if (!user) {
    throw new Error(`getUserForId: missing user: id ${userId}`);
  }
  return user;
};

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
export const getUserIsActive = (state: GlobalState, userId: UserId): boolean =>
  !!getActiveUsersById(state).get(userId);

/**
 * Whether we have server data for the active account.
 */
// Valid server data must have a user: the self user, at a minimum.
export const getHaveServerData = (state: GlobalState): boolean => getUsers(state).length > 0;
