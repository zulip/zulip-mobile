import { AsyncStorage } from 'react-native';
import { applyMiddleware, compose, createStore } from 'redux';
import { persistStore, autoRehydrate } from 'redux-persist';

import rootReducer from './reducers';
import middleware from './middleware';

// AsyncStorage.clear(); // use to reset storage during development

const store = compose(
  autoRehydrate(),
  applyMiddleware(...middleware),
)(createStore)(rootReducer);

export const restore = (onFinished) =>
  persistStore(store, {
    blacklist: ['app'],
    storage: AsyncStorage,
  }, onFinished);

export default store;
