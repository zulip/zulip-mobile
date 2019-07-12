/* @flow strict-local */
import { applyMiddleware, compose, createStore } from 'redux';
import type { Store } from 'redux';
import { persistStore, autoRehydrate } from 'redux-persist';
import type { Config } from 'redux-persist';
import { AsyncStorage } from 'react-native';

import type { Action, GlobalState } from '../types';
import rootReducer from './reducers';
import middleware from './middleware';
import ZulipAsyncStorage from './ZulipAsyncStorage';
import createMigration from '../redux-persist-migrate/index';

// AsyncStorage.clear(); // use to reset storage during development

/**
 * Properties on the global store which we explicitly choose not to persist.
 *
 * All properties on the global store should appear either here or in the
 * lists of properties we do persist, below.
 */
// prettier-ignore
export const discardKeys: Array<$Keys<GlobalState>> = [
  'alertWords', 'caughtUp', 'fetching', 'loading',
  'nav', 'presence', 'session', 'topics', 'typing', 'userStatus',
];

/**
 * Properties on the global store which we persist because they are local.
 *
 * These represent information that belongs to this device (and this
 * install of the app), where things wouldn't work right if we didn't
 * persist them.
 */
// prettier-ignore
export const storeKeys: Array<$Keys<GlobalState>> = [
  'migrations', 'accounts', 'drafts', 'outbox', 'settings',
];

/**
 * Properties on the global store which we persist for caching's sake.
 *
 * These represent information for which the ground truth is on the
 * server, but which we persist locally so that we have it cached and
 * don't have to re-download it.
 */
// prettier-ignore
export const cacheKeys: Array<$Keys<GlobalState>> = [
  'flags', 'messages', 'mute', 'narrows', 'realm', 'streams',
  'subscriptions', 'unread', 'userGroups', 'users',
];

/**
 * Drop all server data, as a rehydrate-time migration.
 *
 * Most of our data is just copied from the server, and gets routinely
 * discarded any time the event queue expires and we make a new `/register`
 * call.  That's much more frequent than a new app release, let alone one
 * with a data migration... so forcing the same thing in a migration is
 * inexpensive, and makes a simple way to handle most migrations.
 *
 * One important difference from an expired event queue: `DEAD_QUEUE`
 * leaves the stale data mostly in place, to be clobbered by fresh data
 * by the subsequent `REALM_INIT`.  Here, because the old data may not work
 * with the current code at all, we have to actually discard it up front.
 * The behavior is similar to `ACCOUNT_SWITCH`, which also discards most
 * data: we'll show the loading screen while fetching initial data.  See
 * the `REHYDRATE` handlers in `sessionReducer` and `navReducer` for how
 * that happens.
 */
function dropCache(state: GlobalState): $Shape<GlobalState> {
  const result: $Shape<GlobalState> = {};
  storeKeys.forEach(key => {
    // $FlowFixMe This is well-typed only because it's the same `key` twice.
    result[key] = state[key];
  });
  return result;
}

const migrations: { [string]: (GlobalState) => GlobalState } = {
  // The type is a lie, in several ways:
  //  * The actual object contains only the properties we persist:
  //    those in `storeKeys` and `cacheKeys`, but not `discardKeys`.
  //  * The actual input is from an older version of the code, one with
  //    different data structures -- after all, that's the point of the
  //    migration -- which usually have a different type.
  //  * For all but the latest migration, the same is true of the output.
  //
  // Still, it seems a more helpful approximation than nothing.  Where the
  // falsehoods show through, we freely tell Flow to ignore them.
  '0': state => {
    // We deleted `messages` and created `narrows`.  (Really we renamed
    // `messages` to `narrows, but a migration for delete + create is
    // simpler, and is good enough because these are "cache" data anyway.)
    AsyncStorage.removeItem('reduxPersist:messages');
    // $FlowMigrationFudge
    return dropCache(state);
  },
  // $FlowMigrationFudge
  '3': dropCache,
  '4': state => ({
    ...dropCache(state),
    accounts: state.accounts.map(a => ({ ...a, ackedPushToken: null })),
  }),
  '5': dropCache,
};

const reduxPersistConfig: Config = {
  whitelist: [...storeKeys, ...cacheKeys],
  // $FlowFixMe: https://github.com/rt2zz/redux-persist/issues/823
  storage: ZulipAsyncStorage,
};

const store: Store<*, Action> = createStore(
  rootReducer,
  undefined,
  compose(
    createMigration(migrations, 'migrations'),
    applyMiddleware(...middleware),
    autoRehydrate(),
  ),
);

export const restore = (onFinished?: () => void) =>
  persistStore(store, reduxPersistConfig, onFinished);

export default store;
