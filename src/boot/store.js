/* @flow */
import { AsyncStorage } from 'react-native';
import { applyMiddleware, compose, createStore } from 'redux';
import { persistStore, autoRehydrate } from 'redux-persist';

import config from '../config';
import rootReducer from './reducers';
import middleware from './middleware';

// AsyncStorage.clear(); // use to reset storage during development

let store;
/* eslint-disable no-undef, global-require, import/no-extraneous-dependencies */
if (__DEV__) { // This block of code is never meant to execute in production
  const Reactotron = require('reactotron-react-native').default;
/* eslint-enable */
  store = Reactotron.createStore(
    rootReducer,
    {},
    compose(
      applyMiddleware(...middleware),
      autoRehydrate()
      )
    );
} else {
  store = compose(
    applyMiddleware(...middleware),
    autoRehydrate()
  )(createStore)(rootReducer);
}

export const restore = (onFinished?: () => void) =>
  persistStore(
    store,
    {
      whitelist: [...config.storeKeys, ...config.cacheKeys],
      storage: AsyncStorage,
    },
    onFinished,
  );

const exportStore = store; // Just a hack to avoid eslint error of exporting non const value.

export default exportStore;
