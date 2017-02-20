import { AsyncStorage } from 'react-native';
import { applyMiddleware, compose, createStore } from 'redux';
import thunk from 'redux-thunk';
import createLogger from 'redux-logger';
import { persistStore, autoRehydrate } from 'redux-persist';
import { REHYDRATE } from 'redux-persist/constants';
import createActionBuffer from 'redux-action-buffer';

import rootReducer from './reducers';

// AsyncStorage.clear(); // use to reset storage during development

// Set up middleware
const middleware = [thunk, createActionBuffer(REHYDRATE)];
if (process.env.NODE_ENV === 'development') {
  // Log states and actions to the console in dev mode
  // But only when remote debugging! It really slows down the iOS JSC
  let runningInChrome = false;
  try {
    // btoa is not available in JSC so we can use it to figure out if we're
    // running in Chrome remote debugging or not
    runningInChrome = !!btoa;
  } catch (err) {
    // pass
  }
  if (runningInChrome) {
    middleware.push(createLogger());
  }
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
