/* @flow */
import { applyMiddleware, compose, createStore } from 'redux';
import type { Store } from 'redux';
import { persistStore, autoRehydrate } from 'redux-persist';
import type { Config } from 'redux-persist';
import { AsyncStorage } from 'react-native';

import type { Action } from '../types';
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
  'flags', 'messages', 'mute', 'narrows', 'realm', 'streams', 'subscriptions', 'unread', 'userGroups', 'users',
];

const migrations = {
  '0': state => {
    // We deleted `messages` and created `narrows`.  (Really we renamed
    // `messages` to `narrows, but a migration for delete + create is
    // simpler, and is good enough because these are "cache" data anyway.)
    AsyncStorage.removeItem('reduxPersist:messages');
    const { messages, ...restState } = state; // eslint-disable-line no-unused-vars
    return { ...restState, narrows: {} };
  },
  '1': state => ({
    // We changed the format of `narrows` and created `messages`.  Just
    // initialize them both.
    ...state,
    messages: {},
    narrows: {},
  }),
  '2': state => ({
    ...state,
    realm: {
      ...state.realm,
      pushToken: {
        token: state.realm.pushToken.token,
        // Drop `result` and `msg`.
      },
    },
  }),
  '3': state => ({
    ...state,
    realm: {
      ...state.realm,
      pushToken: {
        // Previously we used an empty string here to mean "no value".
        token: state.realm.pushToken.token || null,
      },
    },
  }),
  '4': state => {
    const { pushToken, ...restRealm } = state.realm; // eslint-disable-line no-unused-vars
    return {
      ...state,
      realm: restRealm,
      accounts: state.accounts.map(a => ({ ...a, ackedPushToken: null })),
    };
  },
  '5': state => ({
    ...state,
    realm: {
      ...state.realm,
      emoji: Object.keys(state.realm.emoji).reduce((emojis, id) => {
        emojis[id] = { ...state.realm.emoji[id], code: id.toString() };
        return emojis;
      }, {}),
    },
  }),
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
