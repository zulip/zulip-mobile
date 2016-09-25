import { AsyncStorage } from 'react-native';

import { applyMiddleware, compose, createStore } from 'redux';
import thunk from 'redux-thunk';
import createLogger from 'redux-logger';
import { persistStore, autoRehydrate } from 'redux-persist';

import rootReducer from './reducers';

// Set up middleware
const middleware = [thunk];
if (process.env.NODE_ENV === 'development') {
  // Log states and actions to the console in dev mode
  middleware.push(createLogger());
}

const store = compose(
  applyMiddleware(...middleware),
  autoRehydrate()
)(createStore)(rootReducer);

persistStore(store, {
  config: { whitelist: 'user' },
  storage: AsyncStorage,
});

export default store;
