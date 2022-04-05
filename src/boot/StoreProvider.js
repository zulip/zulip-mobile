/* @flow strict-local */
import React, { useEffect } from 'react';
import type { Node } from 'react';

import { observeStore } from '../redux';
import { Provider } from '../react-redux';
import * as logging from '../utils/logging';
import { getAccount, tryGetActiveAccountState } from '../selectors';
import store, { restore } from './store';
import timing from '../utils/timing';

type Props = $ReadOnly<{|
  children: Node,
|}>;

export default function StoreProvider(props: Props): Node {
  useEffect(() => {
    timing.start('Store hydration');
    restore(() => {
      timing.end('Store hydration');
    });

    const unsubscribeStoreObserver = observeStore(
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
        //
        // On fetch, we'll have called this already before entering the
        // reducers, so this will be redundant.  But on switching accounts,
        // this is the call that will make the change.
        logging.setTagsFromServerVersion(zulipVersion);
      },
    );

    return () => unsubscribeStoreObserver();
  }, []);

  return <Provider store={store}>{props.children}</Provider>;
}
