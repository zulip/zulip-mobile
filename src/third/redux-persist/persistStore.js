/* @flow strict-local */
import type { Store } from 'redux';

import type { Config, OverpromisedRehydrateAction, Persistor } from './types';
import { REHYDRATE } from './constants';
import getStoredState from './getStoredState';
import createPersistor from './createPersistor';

export default function persistStore<
  S: { ... },
  A,
  // The dispatch type should accept our rehydrate actions.
  D: OverpromisedRehydrateAction => mixed,
>(
  store: Store<S, A, D>,
  config: Config, // = Object.freeze({}),
  onComplete?: () => void,
): Persistor {
  const persistor = createPersistor(store, config);
  persistor.pause();

  setImmediate(restore);

  return persistor;

  async function restore() {
    try {
      const restoredState: { ... } = await getStoredState(config);

      // This fixme is how we make the impossible promise in
      // OverpromisedRehydrateAction.  See that type's jsdoc.
      store.dispatch(rehydrateAction((restoredState: $FlowFixMe)));

      // Don't persist `REHYDRATE`'s payload unnecessarily.
      //
      // The state in memory now (after `REHYDRATE` has fired)
      // contains no useful information beyond what has already
      // been saved to storage, so we can skip saving it back to
      // storage. That's because:
      //
      // (a) The state in memory was empty before `REHYDRATE`
      //     fired. There wasn't anything interesting there that
      //     was merged with `REHYDRATE`'s payload. And,
      //
      // (b) The `REHYDRATE` payload itself came straight (via
      //     our reviver) from what was saved to storage.  And if
      //     any migrations were needed, they already ran before
      //     getStoredState was able to return, and acted on the
      //     actual data in storage.
      //
      // Part of the work for preventing the save is already
      // done: `.pause()` is called on `persistor` above, and
      // `.resume()` is called after. This does mean that
      // persisting `REHYDRATE`'s payload isn't triggered
      // directly on `REHYDRATE`. However, it is triggered on a
      // *subsequent* action, because, upon each action, the
      // persistor compares a piece of `lastState` to the
      // corresponding piece of `state` to check whether that
      // piece needs to be persisted -- and, on an action just
      // after `REHYDRATE`, `lastState` is stale, containing the
      // pre-`REHYDRATE` state. That's because `lastState`
      // doesn't naturally update when the persistor is paused.
      //
      // So, fix that by still resetting `lastState` with the
      // result of `REHYDRATE` when the persistor is paused; we
      // can do that because we've exposed `_resetLastWrittenState` on
      // the persistor.
      persistor._resetLastWrittenState(); // eslint-disable-line no-underscore-dangle
    } finally {
      persistor.resume();

      if (onComplete) {
        onComplete();
      }
    }
  }
}

function rehydrateAction(payload) {
  return {
    type: REHYDRATE,
    payload,
  };
}
