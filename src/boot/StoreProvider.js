/* @flow */
import React, { PureComponent } from 'react';
import { Provider } from 'react-redux';

import type { ChildrenArray } from '../types';
import store, { restore } from './store';
import timing from '../utils/timing';

type Props = {
  children: ChildrenArray<*>,
};

export default class StoreHydrator extends PureComponent<Props> {
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
