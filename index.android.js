import React, { Component } from 'react';
import { AppRegistry } from 'react-native';

import { applyMiddleware, createStore } from 'redux';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import createLogger from 'redux-logger';

import rootReducer from './src/reducers';
import ZulipApp from './src/ZulipApp';

// Set up middleware
const middleware = [thunk];
if (process.env.NODE_ENV === 'development') {
  // Log states and actions to the console in dev mode
  middleware.push(createLogger());
}

const store = applyMiddleware(...middleware)(createStore)(rootReducer);

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
