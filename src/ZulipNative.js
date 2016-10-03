import React, { Component } from 'react';
import { ActivityIndicator } from 'react-native';
import { Provider } from 'react-redux';

import store, { restore } from './store';
import App from './App';

export default class ZulipNative extends Component {
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
        <App />
      </Provider>
    );
  }
}
