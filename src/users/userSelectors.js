/* @flow strict-local */
import { createSelector } from 'reselect';

import type { GlobalState, PerAccountState, UserOrBot, Selector, User, UserId } from '../types';
import { getUsers, getCrossRealmBots, getNonActiveUsers } from '../directSelectors';
import { getHasAuth, tryGetActiveAccount } from '../account/accountsSelectors';

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
export const getSortedUsers: Selector<User[]> = createSelector(getUsers, users =>
  [...users].sort((x1, x2) => x1.full_name.toLowerCase().localeCompare(x2.full_name.toLowerCase())),
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
export const getOwnUserId = (state: PerAccountState): UserId => {
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
export const getOwnEmail = (state: PerAccountState): string => {
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

/**
 * Whether we have server data for the active account.
 *
 * This can be used to decide whether the app's main UI which shows data
 * from the server should render itself, or should fall back to a loading
 * screen.
 */
export const getHaveServerData = (state: GlobalState): boolean => {
  // The implementation has to be redundant, because upon rehydrate we can
  // unfortunately have some of our state subtrees containing server data
  // while others don't, reflecting different points in time from the last
  // time the app ran.  In particular, if the user switched accounts (so
  // that we cleared server data in Redux) and then the app promptly
  // crashed, or was killed, that clearing-out may have reached some
  // subtrees but not others.  See #4587 for an example, and #4841 overall.

  // It's important that we never stick around in a state where we're trying
  // to show the main UI but this function returns false.  When in that
  // state, we just show a loading screen with no UI, so there has to be
  // something happening in the background that will get us out of it.
  //
  // The basic strategy is:
  //  * When we start showing the main UI, we always kick off an initial
  //    fetch.  Specifically:
  //    * If at startup (upon rehydrate) we show the main UI, we do so.
  //      This is controlled by `getInitialRouteInfo`, together with
  //      `sessionReducer` as it sets `needsInitialFetch`.
  //    * When we navigate to the main UI (via `resetToMainTabs`), we always
  //      also dispatch an action that causes `needsInitialFetch` to be set.
  //    * Plus, that initial fetch has a timeout, so it will always take us
  //      away from a loading screen regardless of server/network behavior.
  //
  //  * When we had server data and we stop having it, we always also either
  //    navigate away from the main UI, or kick off a new initial fetch.
  //    Specifically:
  //    * Between this function and the reducers, we should only stop having
  //      server data upon certain actions in `accountActions`.
  //    * Some of those actions cause `needsInitialFetch` to be set, as above.
  //    * Those that don't should always be accompanied by navigating away
  //      from the main UI, with `resetToAccountPicker`.
  //
  // Ideally the decisions "should we show the loading screen" and "should
  // we kick off a fetch" would be made together in one place, so that it'd
  // be possible to confirm they align without so much nonlocal reasoning.

  // Specific facts used in the reasoning below (within the strategy above):
  //  * The actions LOGIN_SUCCESS and ACCOUNT_SWITCH cause
  //    `needsInitialFetch` to be set.
  //  * The action LOGOUT is always accompanied by navigating away from the
  //    main UI.
  //  * A successful initial fetch causes a REALM_INIT action.  A failed one
  //    causes either LOGOUT, or an abort that ensures we're not at a
  //    loading screen.

  // Any valid server data is about the active account.  So if there is no
  // active account, then any server data we appear to have can't be valid.
  if (!tryGetActiveAccount(state)) {
    // From `accountsReducer`:
    //  * This condition is resolved by LOGIN_SUCCESS.
    //  * It's created only by ACCOUNT_REMOVE.
    //
    // When this condition applies, LOGIN_SUCCESS is the only way we might
    // navigate to the main UI.
    //
    // ACCOUNT_REMOVE is available only from the account-picker screen (not
    // the main UI), and moreover is available for the active account only
    // when not logged in, in which case the main UI can't be on the
    // navigation stack either.
    return false;
  }

  // Similarly, any valid server data comes from the active account being
  // logged in.
  if (!getHasAuth(state)) {
    // From `accountsReducer`:
    //  * This condition is resolved by LOGIN_SUCCESS.
    //  * It's created only by ACCOUNT_REMOVE, by LOGOUT, and by (a
    //    hypothetical) ACCOUNT_SWITCH for a logged-out account.
    //
    // When this condition applies, LOGIN_SUCCESS is the only way we might
    // navigate to the main UI.
    //
    // For ACCOUNT_REMOVE, see the previous condition.
    // ACCOUNT_SWITCH we only do for logged-in accounts.
    return false;
  }

  // Valid server data must have a user: the self user, at a minimum.
  if (getUsers(state).length === 0) {
    // From `usersReducer`:
    //  * This condition is resolved by REALM_INIT.
    //  * It's created only by LOGIN_SUCCESS, LOGOUT, and ACCOUNT_SWITCH.
    return false;
  }

  // It must also have the self user's user ID.
  const ownUserId = state.realm.user_id;
  if (ownUserId === undefined) {
    // From `realmReducer`:
    //  * This condition is resolved by REALM_INIT.
    //  * It's created only by LOGIN_SUCCESS, LOGOUT, and ACCOUNT_SWITCH.
    return false;
  }

  // We can also do a basic consistency check between those two subtrees:
  // the self user identified in `state.realm` is among those we have in
  // `state.users`.  (If for example the previous run of the app switched
  // accounts, and got all the way to writing the new account's
  // `state.realm` but not even clearing out `state.users` or vice versa,
  // then this check would fire.  And in that situation without this check,
  // we crash early on because `getOwnUser` fails.)
  if (!getUsersById(state).get(ownUserId)) {
    // From the reducers (and assumptions about the server's data):
    //  * This condition is resolved by REALM_INIT.
    //  * It's never created (post-rehydrate.)
    return false;
  }

  // TODO: A nice bonus would be to check that the account matches the
  // server data, given any of:
  //  * user ID in `Account` (#4951)
  //  * realm URL in `RealmState`
  //  * delivery email in `RealmState` and/or `User` (though not sure this
  //    is available from server, even for self, in all configurations)

  // Any other subtree could also have been emptied while others weren't,
  // or otherwise be out of sync.
  //
  // But it appears that in every other subtree containing server state, the
  // empty state (i.e. the one we reset to on logout or account switch) is a
  // valid possible state.  That means (a) we can't so easily tell that it's
  // out of sync, but also (b) the app's UI is not so likely to just crash
  // from the get-go if it is -- because at least it won't crash simply
  // because the state is empty.
  //
  // There're still plenty of other ways different subtrees can be out of
  // sync with each other: `state.narrows` could know about some new message
  // that `state.messages` doesn't, or `state.messages` have a message sent
  // by a user that `state.users` has no record of.
  //
  // But given that shortly after starting to show the main app UI (whether
  // that's at startup, or after picking an account or logging in) we go
  // fetch fresh data from the server anyway, the checks above are hopefully
  // enough to let the app survive that long.
  return true;
};
