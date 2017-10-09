/* @flow */
import React, { PureComponent } from 'react';
import { Provider } from 'react-redux';

import store, { restore } from './store';
import timing from '../utils/timing';

export default class StoreHydrator extends PureComponent<void> {
  componentWillMount() {
    timing.start('Store hydration');
    restore(() => {
      timing.end('Store hydration');
    });
  }

  render() {
    return <Provider store={store}>{this.props.children}</Provider>;
  }
}
