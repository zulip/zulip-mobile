/* @flow */
import { AsyncStorage } from 'react-native';
import { applyMiddleware, compose, createStore } from 'redux';
import { createMigrate, persistStore, persistReducer } from 'redux-persist';
import getStoredStateMigrateV4 from 'redux-persist/lib/integration/getStoredStateMigrateV4';

import config from '../config';
import rootReducer from './reducers';
import middleware from './middleware';
import ZulipAsyncStorage from './ZulipAsyncStorage';
import { nullFunction } from '../nullObjects';

// AsyncStorage.clear(); // use to reset storage during development

// uncomment the following lines to integrate reactotron with redux
// const store = Reactotron.createStore(
//   rootReducer,
//   compose(autoRehydrate(), applyMiddleware(...middleware)),
// );

// DO NOT change this object. It contains the config for the last version
// of the code that used redux-persist v4. This config object is used for
// migrating any device that is ugprading from an app version that uses
// redux-persist v4 to an app version that uses redux-persist v5.
const reduxPersistConfigV4 = {
  whitelist: [
    'accounts',
    'drafts',
    'messages',
    'mute',
    'outbox',
    'realm',
    'settings',
    'streams',
    'subscriptions',
    'unread',
    'userGroups',
    'users',
  ],
  storage: ZulipAsyncStorage,
};

const migrations = {
  '0': state => {
    const oldKeys = reduxPersistConfigV4.whitelist.map(key => `reduxPersist:${key}`);
    // multiRemove() errors when `oldKeys` are not actually stored. This is
    // what we want to achieve anyways, so just ignore the error.
    AsyncStorage.multiRemove(oldKeys).catch(nullFunction);
    return state;
  },
};

const reduxPersistConfig = {
  key: 'root',
  version: 0,
  whitelist: [...config.storeKeys, ...config.cacheKeys],
  storage: ZulipAsyncStorage,
  getStoredState: getStoredStateMigrateV4(reduxPersistConfigV4),
  migrate: createMigrate(migrations),
};

const reducer = persistReducer(reduxPersistConfig, rootReducer);

const store = createStore(reducer, undefined, compose(applyMiddleware(...middleware)));

export const persistor = persistStore(store);

export default store;
