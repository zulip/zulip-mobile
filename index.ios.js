import React, { Component } from 'react';
import { AppRegistry } from 'react-native';
import { Provider } from 'react-redux';

import ZulipApp from './src/ZulipApp';
import store from './src/store';

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
