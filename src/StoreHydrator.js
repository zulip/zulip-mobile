/* @flow */
import React, { PureComponent } from 'react';
import { Provider } from 'react-redux';

import store, { restore } from './store';

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
    restore(() => {
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
