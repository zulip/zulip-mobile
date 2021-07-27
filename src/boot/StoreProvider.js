/* @flow strict-local */
import React, { PureComponent } from 'react';
import type { Node } from 'react';
import { Provider } from 'react-redux';

import { observeStore } from '../redux';
import * as logging from '../utils/logging';
import { tryGetActiveAccount } from '../selectors';
import store, { restore } from './store';
import timing from '../utils/timing';

type Props = $ReadOnly<{|
  children: Node,
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

  render(): Node {
    return <Provider store={store}>{this.props.children}</Provider>;
  }
}
