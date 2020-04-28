/* @flow strict-local */
import { applyMiddleware, compose, createStore } from 'redux';
import type { Store } from 'redux';
import Immutable from 'immutable';
import * as Serialize from 'remotedev-serialize';
import { persistStore, autoRehydrate } from '../third/redux-persist';
import type { Config } from '../third/redux-persist';

import type { Action, GlobalState } from '../types';
import { ZulipVersion } from '../utils/zulipVersion';
import rootReducer from './reducers';
import middleware from './middleware';
import ZulipAsyncStorage from './ZulipAsyncStorage';
import createMigration from '../redux-persist-migrate/index';

// AsyncStorage.clear(); // use to reset storage during development

/**
 * Properties on the global state which we explicitly choose not to persist.
 *
 * All properties on the global Redux state should appear either here or in
 * the lists of properties we do persist, below.
 */
// prettier-ignore
export const discardKeys: Array<$Keys<GlobalState>> = [
  'alertWords', 'caughtUp', 'fetching',
  'nav', 'presence', 'session', 'topics', 'typing', 'userStatus',
];

/**
 * Properties on the global state which we persist because they are local.
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
 * Properties on the global state which we persist for caching's sake.
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

  // Example if removing a top-level subtree entirely:
  //   import { AsyncStorage } from 'react-native';
  //   ...
  //   AsyncStorage.removeItem('reduxPersist:messages');

  '6': state => ({
    // This rolls up all previous migrations, to clean up after our bug #3553.
    // Mostly we can just `dropCache`, to reload data from the server...
    ...dropCache(state),
    accounts: state.accounts.map(a => ({
      ...a,
      // but in the case of `ackedPushToken` let's be a bit more precise,
      // and avoid clobbering it if present.
      ackedPushToken: a.ackedPushToken !== undefined ? a.ackedPushToken : null,
    })),
  }),

  // $FlowMigrationFudge
  '8': dropCache,

  // Forget any acked push tokens, so we send them again.  This is part of
  // fixing #3695, taking care of any users who were affected before they
  // got the version with the fix.
  '9': state => ({
    ...state,
    accounts: state.accounts.map(a => ({
      ...a,
      ackedPushToken: null,
    })),
  }),

  // Convert old locale names to new, more-specific locale names.
  '10': state => {
    const newLocaleNames = { zh: 'zh-Hans', id: 'id-ID' };
    const { locale } = state.settings;
    const newLocale = newLocaleNames[locale] ?? locale;
    return {
      ...state,
      settings: {
        ...state.settings,
        locale: newLocale,
      },
    };
  },

  // Fixes #3567 for users with cached realm urls with multiple trailing slashes.
  '11': state => ({
    ...state,
    accounts: state.accounts.map(a => ({
      ...a,
      realm: a.realm.replace(/\/+$/, ''),
    })),
  }),

  // Accounts.zulipVersion is now string | null
  '12': state => ({
    ...state,
    accounts: state.accounts.map(a => ({
      ...a,
      zulipVersion: a.zulipVersion !== undefined ? a.zulipVersion : null,
    })),
  }),
};

/**
 * A special identifier used by `remotedev-serialize`.
 *
 * Use this in the custom replacer and reviver, below, to make it
 * easier to be consistent between them and avoid costly typos.
 */
const SERIALIZED_TYPE_FIELD_NAME: '__serializedType__' = '__serializedType__';

const customReplacer = (key, value, defaultReplacer) => {
  if (value instanceof ZulipVersion) {
    return { data: value.raw(), [SERIALIZED_TYPE_FIELD_NAME]: 'ZulipVersion' };
  }
  return defaultReplacer(key, value);
};

const customReviver = (key, value, defaultReviver) => {
  if (value !== null && typeof value === 'object' && SERIALIZED_TYPE_FIELD_NAME in value) {
    const data = value.data;
    switch (value[SERIALIZED_TYPE_FIELD_NAME]) {
      case 'ZulipVersion':
        return new ZulipVersion(data);
      default:
      // Fall back to defaultReviver, below
    }
  }
  return defaultReviver(key, value);
};

const { stringify, parse } = Serialize.immutable(Immutable, null, customReplacer, customReviver);

const reduxPersistConfig: Config = {
  whitelist: [...storeKeys, ...cacheKeys],
  // $FlowFixMe: https://github.com/rt2zz/redux-persist/issues/823
  storage: ZulipAsyncStorage,
  serialize: stringify,
  deserialize: parse,
};

const store: Store<GlobalState, Action> = createStore(
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
