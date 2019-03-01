/* @flow strict-local */
import React, { PureComponent } from 'react';
import { Provider } from 'react-redux';

import type { React$Node } from '../types';
import store, { restore } from './store';
import timing from '../utils/timing';

type Props = {|
  children: React$Node,
|};

export default class StoreHydrator extends PureComponent<Props> {
  componentDidMount() {
    timing.start('Store hydration');
    restore(() => {
      timing.end('Store hydration');
    });
  }

  render() {
    return <Provider store={store}>{this.props.children}</Provider>;
  }
}
