import React, { Component } from 'react';
import { Provider } from 'react-redux';

import store, { restore } from './store';
import LoadingScreen from './start/LoadingScreen';
import App from './App';

export default class ZulipMobile extends Component {

  state = {
    rehydrated: false,
  };

  componentWillMount() {
    restore(() => {
      this.setState({ rehydrated: true });
    });
  }

  render() {
    if (!this.state.rehydrated) {
      return <LoadingScreen />;
    }

    return (
      <Provider store={store}>
        <App />
      </Provider>
    );
  }
}
