/* @flow */
import React, { PureComponent } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/lib/integration/react';

import type { ChildrenArray } from '../types';
import store, { persistor } from './store';
import LoadingScreen from '../start/LoadingScreen';

type Props = {
  children: ChildrenArray<*>,
};

export default class StoreHydrator extends PureComponent<Props> {
  props: Props;

  render() {
    return (
      <Provider store={store}>
        <PersistGate loading={<LoadingScreen />} persistor={persistor}>
          {this.props.children}
        </PersistGate>
      </Provider>
    );
  }
}
