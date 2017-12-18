/* @flow */
import { AsyncStorage } from 'react-native';
import { applyMiddleware, compose, createStore } from 'redux';
import { persistStore, autoRehydrate } from 'redux-persist';

import rootReducer from './reducers';
import middleware from './middleware';

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
      blacklist: ['app', 'caughtUp', 'fetching', 'presence', 'topics', 'typing', 'users', 'chat'],
      storage: AsyncStorage,
    },
    onFinished,
  );

export default store;
