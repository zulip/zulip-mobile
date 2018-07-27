/* @flow */
import { applyMiddleware, compose, createStore } from 'redux';
import { persistStore, autoRehydrate } from 'redux-persist';

import config from '../config';
import rootReducer from './reducers';
import middleware from './middleware';
import ZulipAsyncStorage from './ZulipAsyncStorage';

// AsyncStorage.clear(); // use to reset storage during development

// uncomment the following lines to integrate reactotron with redux
// const store = Reactotron.createStore(
//   rootReducer,
//   compose(autoRehydrate(), applyMiddleware(...middleware)),
// );

const store = compose(applyMiddleware(...middleware), autoRehydrate())(createStore)(rootReducer);

export const restore = (onFinished?: () => void) =>
  persistStore(
    store,
    {
      whitelist: [...config.storeKeys, ...config.cacheKeys],
      // $FlowFixMe: https://github.com/rt2zz/redux-persist/issues/823
      storage: ZulipAsyncStorage,
    },
    onFinished,
  );

export default store;
