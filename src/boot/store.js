/* @flow */
import { AsyncStorage } from 'react-native';
import { applyMiddleware, compose, createStore } from 'redux';
import { persistStore, autoRehydrate } from 'redux-persist';
import Reactotron from 'reactotron-react-native';

import rootReducer from './reducers';
import middleware from './middleware';

// AsyncStorage.clear(); // use to reset storage during development

let store  = null; 

if(__DEV__) {
  store = Reactotron.createStore(rootReducer, {},compose(applyMiddleware(...middleware), autoRehydrate()))
} else {
  store = compose(applyMiddleware(...middleware), autoRehydrate())(Reactotron.createStore)(rootReducer);
}

export const restore = (onFinished?: () => void) =>
  persistStore(
    store,
    {
      blacklist: [
        'caughtUp',
        'fetching',
        'loading',
        'nav',
        'presence',
        'session',
        'topics',
        'typing',
        'users',
      ],
      storage: AsyncStorage,
    },
    onFinished,
  );

export default store;
