import React, {
  AppRegistry,
  Component,
} from 'react-native';

// React / Redux modules
import {applyMiddleware, createStore} from 'redux';
import {Provider} from 'react-redux';
import thunk from 'redux-thunk';

import rootReducer from './src/reducers';
import ZulipApp from './src/ZulipApp';

/**
 * Logs all actions and states after they are dispatched.
 */
const logger = store => next => action => {
  console.group(action.type)
  console.info('dispatching', action)
  let result = next(action)
  console.log('next state', store.getState())
  console.groupEnd(action.type)
  return result
}

const store = applyMiddleware(thunk)(createStore)(rootReducer);

class ZulipNative extends Component {
  render() {
    return (
      <Provider store={store}>
        <ZulipApp />
      </Provider>
    );
  }
}

AppRegistry.registerComponent('ZulipNative', () => ZulipNative);
