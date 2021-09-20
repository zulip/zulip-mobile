/* @flow strict-local */
import React, { PureComponent } from 'react';
import type { Node } from 'react';
import { Provider } from 'react-redux';

import { observeStore } from '../redux';
import * as logging from '../utils/logging';
import { getAccount, tryGetActiveAccountState } from '../selectors';
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
      state => {
        const perAccountState = tryGetActiveAccountState(state);
        if (!perAccountState) {
          return undefined;
        }
        return getAccount(perAccountState).zulipVersion;
      },
      zulipVersion => {
        // TODO(#5005): This is for the *active* account; that may not be
        //   the one a given piece of code is working with!
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
