import React, { Component } from 'react';
import { View, Text, AppRegistry } from 'react-native';
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
      return <View><Text>Loading...</Text></View>;
    }

    return (
      <Provider store={store}>
        <ZulipApp />
      </Provider>
    );
  }
}

AppRegistry.registerComponent('ZulipNative', () => ZulipNative);
