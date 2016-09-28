import { Iterable } from 'immutable';
import { AsyncStorage } from 'react-native';
import { applyMiddleware, compose, createStore } from 'redux';
import thunk from 'redux-thunk';
import createLogger from 'redux-logger';
import { persistStore, autoRehydrate } from 'redux-persist';
import { REHYDRATE } from 'redux-persist/constants';
import createActionBuffer from 'redux-action-buffer';
import immutableTransform from 'redux-persist-transform-immutable';

import rootReducer from './reducers';

// AsyncStorage.clear(); // use to reset storage during development

// Set up middleware
const middleware = [thunk, createActionBuffer(REHYDRATE)];
if (process.env.NODE_ENV === 'development') {
  // Log states and actions to the console in dev mode
  middleware.push(createLogger({
    stateTransformer: (state) => {
      const newState = {};
      for (const i of Object.keys(state)) {
        newState[i] = Iterable.isIterable(state[i]) ? state[i].toJS() : state[i];
      }
      return newState;
    },
  }));
}

const store = compose(
  autoRehydrate(),
  applyMiddleware(...middleware),
)(createStore)(rootReducer);

export const restore = (onFinished) =>
  persistStore(store, {
    transforms: [immutableTransform()],
    whitelist: ['auth'],
    storage: AsyncStorage,
  }, onFinished);

export default store;
