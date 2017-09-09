/* @flow */
import React, { PureComponent } from 'react';
import { Provider } from 'react-redux';

import store, { restore } from './store';
import timing from './utils/timing';
import Providers from './Providers';

export default class StoreHydrator extends PureComponent {
  state: {
    isHydrated: boolean,
  };

  componentWillMount() {
    timing.start('Store hydration');
    restore(() => {
      timing.end('Store hydration');
    });
  }

  render() {
    return (
      <Provider store={store}>
        <Providers />
      </Provider>
    );
  }
}
