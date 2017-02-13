import React, { Component } from 'react';
import { Provider } from 'react-redux';

import store, { restore } from './store';
import LoadingScreen from './start/LoadingScreen';
import NavigationContainer from './nav/NavigationContainer';

import { getAuth } from './account/accountSelectors';
import requestInitialServerData from './main/requestInitialServerData';

export default class ZulipMobile extends Component {

  state = {
    rehydrated: false,
  };

  componentWillMount() {
    restore(() => {
      store.subscribe(() => {
        // Fetch initial server data (and register for the event queue)
        const state = store.getState();
        if (state.app.needsInitialFetch) {
          store.dispatch(requestInitialServerData(getAuth(state)));
        }
      });
      this.setState({ rehydrated: true });
    });
  }

  render() {
    if (!this.state.rehydrated) {
      return <LoadingScreen />;
    }

    return (
      <Provider store={store}>
        <NavigationContainer />
      </Provider>
    );
  }
}
