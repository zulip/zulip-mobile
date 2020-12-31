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
          store.dispatch(rehydrateAction(restoredState, err))

          // Ensure the payload of `REHYDRATE` isn't persisted.
          //
          // The `REHYDRATE` payload contains exactly every useful
          // piece of state; there's nothing useful in the existing
          // state before it arrives that it has to merge with. Since
          // the `REHYDRATE` payload comes from the disk, there's no
          // reason we'd want go and save it *back* to the disk when
          // `REHYDRATE` arrives.
          //
          // Part of the work for preventing that is already done;
          // `.pause()` is called on `persistor` above, and
          // `.resume()` is called after. This does mean that
          // persisting `REHYDRATE`'s payload isn't triggered directly
          // on `REHYDRATE`. And yet, it is triggered on a
          // *subsequent* action, because, upon each action, the
          // persistor compares a piece of `lastState` to the
          // corresponding piece of `state` to check whether that
          // piece needs to be persisted -- and, on an action just
          // after `REHYDRATE`, `lastState` is stale, containing the
          // pre-`REHYDRATE` state. That's because `lastState` doesn't
          // naturally update when the persistor is paused.
          //
          // So, fix that by still resetting `lastState` with the
          // result of `REHYDRATE` when the persistor is paused; we
          // can do that because we've exposed `_resetLastState` on
          // the persistor.
          persistor._resetLastState()
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
