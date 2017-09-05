/* @flow */
import React, { PureComponent } from 'react';
import { Provider } from 'react-redux';

import store, { restore } from './store';
import timing from './utils/timing';
import LoadingScreen from './start/LoadingScreen';
import Providers from './Providers';

export default class StoreHydrator extends PureComponent {
  state: {
    isHydrated: boolean,
  };

  state = {
    isHydrated: false,
  };

  componentWillMount() {
    timing.start('Store hydration');
    restore(() => {
      timing.end('Store hydration');
      this.setState({ isHydrated: true });
    });
  }

  render() {
    const { isHydrated } = this.state;

    if (!isHydrated) {
      return <LoadingScreen />;
    }

    return (
      <Provider store={store}>
        <Providers />
      </Provider>
    );
  }
}
