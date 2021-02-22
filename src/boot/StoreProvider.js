/* @flow strict-local */
import React, { PureComponent } from 'react';
import { Provider } from 'react-redux';
import type { Node as React$Node } from 'react';

import { observeStore } from '../redux';
import * as logging from '../utils/logging';
import { tryGetActiveAccount } from '../selectors';
import store, { restore } from './store';
import timing from '../utils/timing';

type Props = $ReadOnly<{|
  children: React$Node,
|}>;

export default class StoreProvider extends PureComponent<Props> {
  unsubscribeStoreObserver: () => void;

  componentDidMount() {
    timing.start('Store hydration');
    restore(() => {
      timing.end('Store hydration');
    });

    this.unsubscribeStoreObserver = observeStore(
      store,
      // onChange will fire when this value changes
      state => tryGetActiveAccount(state)?.zulipVersion,
      zulipVersion => {
        logging.setTagsFromServerVersion(zulipVersion);
      },
    );
  }

  componentWillUnmount() {
    if (this.unsubscribeStoreObserver) {
      this.unsubscribeStoreObserver();
    }
  }

  render() {
    return <Provider store={store}>{this.props.children}</Provider>;
  }
}
