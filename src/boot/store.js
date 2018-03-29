/* @flow */
import { AsyncStorage } from 'react-native';
import { applyMiddleware, compose, createStore } from 'redux';
import { persistStore, autoRehydrate } from 'redux-persist';
import Reactotron from 'reactotron-react-native';

import config from '../config';
import rootReducer from './reducers';
import middleware from './middleware';

// AsyncStorage.clear(); // use to reset storage during development

// uncomment the following lines to integrate reactotron with redux
// const store = Reactotron.createStore(
//   rootReducer,
//   compose(autoRehydrate(), applyMiddleware(...middleware)),
// );

const store  = null; 

if(__DEV__) {
  store = Reactotron.createStore(rootReducer, {},compose(applyMiddleware(...middleware), autoRehydrate()))
} else {
  store = compose(applyMiddleware(...middleware), autoRehydrate())(Reactotron.createStore)(rootReducer);
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

export default store;
