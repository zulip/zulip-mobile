/* @flow strict-local */
import React, { PureComponent } from 'react';
import { Provider } from 'react-redux';

import type { Node as React$Node } from 'react';
import store, { restore } from './store';
import timing from '../utils/timing';

type Props = $ReadOnly<{|
  children: React$Node,
|}>;

export default class StoreProvider extends PureComponent<Props> {
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
