/* @flow */
import { applyMiddleware, compose, createStore } from 'redux';
import { persistStore, autoRehydrate } from 'redux-persist';
import type { Config } from 'redux-persist';

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
export const discardKeys = [
  'alertWords', 'caughtUp', 'fetching', 'flags', 'loading',
  'nav', 'presence', 'session', 'topics', 'typing',
];

/**
 * Properties on the global store which we persist because they are local.
 *
 * These represent information that belongs to this device (and this
 * install of the app), where things wouldn't work right if we didn't
 * persist them.
 */
export const storeKeys = ['migrations', 'accounts', 'drafts', 'outbox', 'settings'];

/**
 * Properties on the global store which we persist for caching's sake.
 *
 * These represent information for which the ground truth is on the
 * server, but which we persist locally so that we have it cached and
 * don't have to re-download it.
 */
// prettier-ignore
export const cacheKeys = [
 'messages', 'mute', 'realm', 'streams', 'subscriptions', 'unread', 'userGroups', 'users',
];

const migrations = {};

const reduxPersistConfig: Config = {
  whitelist: [...storeKeys, ...cacheKeys],
  // $FlowFixMe: https://github.com/rt2zz/redux-persist/issues/823
  storage: ZulipAsyncStorage,
};

const store = createStore(
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
