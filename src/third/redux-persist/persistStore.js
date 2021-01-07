import { REHYDRATE } from './constants'
import getStoredState from './getStoredState'
import createPersistor from './createPersistor'
import setImmediate from './utils/setImmediate'

export default function persistStore (store, config = {}, onComplete) {
  // defaults
  // @TODO remove shouldRestore
  const shouldRestore = !config.skipRestore
  if (process.env.NODE_ENV !== 'production' && config.skipRestore) console.warn('redux-persist: config.skipRestore has been deprecated. If you want to skip restoration use `createPersistor` instead')

  let purgeKeys = null

  // create and pause persistor
  const persistor = createPersistor(store, config)
  persistor.pause()

  // restore
  if (shouldRestore) {
    setImmediate(() => {
      getStoredState(config, (err, restoredState) => {
        if (err) {
          complete(err)
          return
        }
        // do not persist state for purgeKeys
        if (purgeKeys) {
          if (purgeKeys === '*') restoredState = {}
          else purgeKeys.forEach((key) => delete restoredState[key])
        }
        try {
          // The version (in redux-persist-migrate's terms) that was
          // current in the previous session.
          //
          // Caution: this same expression would give a different
          // value if it were run after the `store.dispatch` line,
          // because redux-persist-migrate's store enhancer
          // `createMigration` mutates `migrations.version` in the
          // action's payload (see `realVersionSetter` in
          // redux-persist-migrate).
          const prevVersion = restoredState.migrations?.version;

          store.dispatch(rehydrateAction(restoredState, err))

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
            // can do that because we've exposed `_resetLastState` on
            // the persistor.
            persistor._resetLastState()
          }
        } finally {
          complete(err, restoredState)
        }
      })
    })
  } else setImmediate(complete)

  function complete (err, restoredState) {
    persistor.resume()
    onComplete && onComplete(err, restoredState)
  }

  return {
    ...persistor,
    purge: (keys) => {
      purgeKeys = keys || '*'
      return persistor.purge(keys)
    }
  }
}

function rehydrateAction (payload, error = null) {
  return {
    type: REHYDRATE,
    payload,
    error
  }
}
