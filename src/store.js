import { AsyncStorage } from 'react-native';
import { applyMiddleware, compose, createStore } from 'redux';
import thunk from 'redux-thunk';
import createLogger from 'redux-logger';
import { persistStore, autoRehydrate } from 'redux-persist';
import { REHYDRATE } from 'redux-persist/constants';
import createActionBuffer from 'redux-action-buffer';

import rootReducer from './reducers';

// AsyncStorage.clear(); // use to reset storage during development

// Only enable remote debugging! It really slows down the iOS JSC
// Checking for btoa() is not available in JSC
const enableLogging = process.env.NODE_ENV === 'development' && global.btoa;

// Set up middleware
const middleware = [thunk, createActionBuffer(REHYDRATE)];

if (enableLogging) {
  middleware.push(createLogger());
}

const store = compose(
  autoRehydrate(),
  applyMiddleware(...middleware),
)(createStore)(rootReducer);

export const restore = (onFinished) =>
  persistStore(store, {
    whitelist: ['account'],
    storage: AsyncStorage,
  }, onFinished);

export default store;
