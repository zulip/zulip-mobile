import React, { Component } from 'react';
import { ActivityIndicator, AppRegistry } from 'react-native';
import { Provider } from 'react-redux';

import ZulipApp from './src/ZulipApp';
import store, { restore } from './src/store';


class ZulipNative extends Component {
  constructor() {
    super();
    this.state = { rehydrated: false };
  }

  componentWillMount() {
    restore(() => {
      this.setState({ rehydrated: true });
    });
  }

  render() {
    if (!this.state.rehydrated) {
      return <ActivityIndicator />;
    }

    return (
      <Provider store={store}>
        <ZulipApp />
      </Provider>
    );
  }
}

AppRegistry.registerComponent('ZulipNative', () => ZulipNative);
