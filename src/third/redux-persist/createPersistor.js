import * as logging from '../../utils/logging';

import { KEY_PREFIX, REHYDRATE } from './constants'
import purgeStoredState from './purgeStoredState'
import stringify from 'json-stringify-safe'

export default function createPersistor (store, config) {
  // defaults
  let serializer;
  if (config.serialize === false) {
    serializer = (data) => data
  } else if (typeof config.serialize === 'function') {
    serializer = config.serialize
  } else {
    serializer = defaultSerializer
  }

  let deserializer;
  if (config.deserialize === false) {
    deserializer = (data) => data
  } else if (typeof config.deserialize === 'function') {
    deserializer = config.deserialize
  } else {
    deserializer = defaultDeserializer
  }
  const blacklist = config.blacklist || []
  const whitelist = config.whitelist || false
  const keyPrefix = config.keyPrefix !== undefined ? config.keyPrefix : KEY_PREFIX

  const storage = config.storage;

  // initialize stateful values
  let lastState = {}
  let paused = false
  let writeInProgress = false

  store.subscribe(() => {
    if (paused || writeInProgress) return;

    (async () => {
      writeInProgress = true

      const state = store.getState()
      const updatedSubstates = []

      Object.keys(state).forEach((key) => {
        if (!passWhitelistBlacklist(key)) return
        if (lastState[key] === state[key]) return
        updatedSubstates.push([key, state[key]])
      });

      const writes = []
      while (updatedSubstates.length > 0) {
        await new Promise(r => setTimeout(r, 0));

        const [key, substate] = updatedSubstates.shift()
        writes.push([key, serializer(substate)])
      }

      writes.forEach(([key, serializedSubstate]) => {
        storage.setItem(createStorageKey(key), serializedSubstate).catch(warnIfSetError(key))
      })

      writeInProgress = false
      lastState = state
    })()
  })

  function passWhitelistBlacklist (key) {
    if (whitelist && whitelist.indexOf(key) === -1) return false
    if (blacklist.indexOf(key) !== -1) return false
    return true
  }

  function adhocRehydrate (incoming, options = {}) {
    let state = {}
    if (options.serial) {
      Object.keys(incoming).forEach((key) => {
        const subState = incoming[key]
        try {
          let data = deserializer(subState)
          let value = data
          state[key] = value
        } catch (err) {
          logging.warn(err, { message: 'Error rehydrating data for a key', key })
        }
      })
    } else state = incoming

    store.dispatch(rehydrateAction(state))
    return state
  }

  function createStorageKey (key) {
    return `${keyPrefix}${key}`
  }

  // return `persistor`
  return {
    rehydrate: adhocRehydrate,
    pause: () => { paused = true },
    resume: () => { paused = false },
    purge: (keys) => purgeStoredState({storage, keyPrefix}, keys),

    /**
     * Set `lastState` to the current `store.getState()`.
     *
     * Only to be used in `persistStore`, to force `lastState` to update
     * with the results of `REHYDRATE` even when the persistor is paused.
     *
     * If this is going to be called, it should be before any writes have
     * begun. Otherwise it may not be effective; see
     *   https://github.com/zulip/zulip-mobile/pull/4694#discussion_r691739007.
     */
    _resetLastState: () => { lastState = store.getState() }
  }
}

function warnIfSetError (key) {
  return function setError (err) {
    if (err) { logging.warn(err, { message: 'Error storing data for key:', key }) }
  }
}

function defaultSerializer (data) {
  return stringify(data, null, null, (k, v) => {
    if (process.env.NODE_ENV !== 'production') return null
    throw new Error(`
      redux-persist: cannot process cyclical state.
      Consider changing your state structure to have no cycles.
      Alternatively blacklist the corresponding reducer key.
      Cycle encounted at key "${k}" with value "${v}".
    `)
  })
}

function defaultDeserializer (serial) {
  return JSON.parse(serial)
}

function rehydrateAction (data) {
  return {
    type: REHYDRATE,
    payload: data
  }
}
