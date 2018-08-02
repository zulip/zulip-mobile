/* @flow */
import React, { PureComponent } from 'react';
import { Provider } from 'react-redux';

import type { ChildrenArray } from '../types';
import store, { restore } from './store';

type Props = {
  children: ChildrenArray<*>,
};

export default class StoreHydrator extends PureComponent<Props> {
  props: Props;

  componentDidMount() {
    restore();
  }

  render() {
    return <Provider store={store}>{this.props.children}</Provider>;
  }
}
