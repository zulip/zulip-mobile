/* @flow strict-local */
import type { Store } from 'redux';

import { historicalCacheKeys24 } from '../../storage/migrations';

import type { Config, OverpromisedRehydrateAction, Persistor } from './types';
import { REHYDRATE } from './constants';
import getStoredState from './getStoredState';
import createPersistor from './createPersistor';

export default function persistStore<
  // The state type should have a schema version for migrations, like so.
  S: { +migrations: { +version?: number }, ... },
  A,
  // The dispatch type should accept our rehydrate actions.
  D: OverpromisedRehydrateAction => mixed,
>(
  store: Store<S, A, D>,
  config: Config, // = Object.freeze({}),
  onComplete?: () => void,
): Persistor {
  let purgeKeys = null;

  const persistor = createPersistor(store, config);
  persistor.pause();

  setImmediate(restore);

  return {
    ...persistor,
    purge: keys => {
      purgeKeys = keys || '*';
      return persistor.purge(keys);
    },
  };

  async function restore() {
    try {
      let restoredState: { ... } = await getStoredState(config);

      // do not persist state for purgeKeys
      if (purgeKeys) {
        if (purgeKeys === '*') {
          restoredState = {};
        } else {
          purgeKeys.forEach(key => delete restoredState[key]);
        }
      }

      // The version (in redux-persist-migrate's terms) that was
      // current in the previous session.
      //
      // Caution: this same expression would give a different
      // value if it were run after the `store.dispatch` line,
      // because redux-persist-migrate's store enhancer
      // `createMigration` mutates `migrations.version` in the
      // action's payload (see `realVersionSetter` in
      // redux-persist-migrate).
      //
      // $FlowFixMe[prop-missing] This can indeed be missing; that's why we check
      const prevVersion: mixed = restoredState.migrations?.version;

      if (typeof prevVersion !== 'number' || prevVersion < 24) {
        // Super-powered `dropCache` to clear out corrupted
        // (because not-fully-migrated) data from #4458.
        // TODO: A proper, non-hacky fix, as Greg describes at
        //   https://chat.zulip.org/#narrow/stream/243-mobile-team/topic/.23M4458.3A.20.22t.2Eget.20is.20not.20a.20function.22.20on.20state.2Enarrows.20at.20sta.2E.2E.2E/near/1119541.
        await persistor.purge(historicalCacheKeys24);
      }

      // This fixme is how we make the impossible promise in
      // OverpromisedRehydrateAction.  See that type's jsdoc.
      store.dispatch(rehydrateAction((restoredState: $FlowFixMe)));

      // The version (in redux-persist-migrate's terms) that is
      // current now, after rehydration.
      const currentVersion = store.getState().migrations.version;

      if (prevVersion !== undefined && prevVersion === currentVersion) {
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
        //     our reviver) from what was saved to storage. It
        //     would only have changed if at least one migration
        //     had run, and it hasn't. In this conditional, we
        //     know that it hasn't because the previous version
        //     (in redux-persist-migrate's terms) is the same as
        //     the current version.
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
      }
    } finally {
      persistor.resume();

      // As mentioned in a comment above, the current strategy of using
      // `.pause()` and `.resume()` means that the time at which the
      // `REHYDRATE` payload is persisted (if we've asked it to be
      // persisted; i.e., if a migration has been done) is not during
      // the processing of `REHYDRATE` itself, but rather during the
      // processing of the action that immediately follows it. Rather
      // than postponing the important task of persisting a migration's
      // results until some arbitrary next action fired somewhere in the
      // app, fire a next action right here, right now.
      //
      // TODO: Find a cleaner way of handling this.
      store.dispatch(
        ({
          // Include a random string, to be sure no other action type
          // matches this one. Like Redux does for the initial action.
          type: `PERSIST_DUMMY/${Math.floor(Math.random() * 2 ** 54).toString(36)}`,

          // The intended param type for `dispatch` would be a union where one
          // branch is "any other `type`".  There isn't a way to specify that
          // without losing the information of what the type looks like for
          // known `type`.  So just ignore that case.
        }: $FlowFixMe),
      );

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
