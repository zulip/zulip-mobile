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
  let storesToProcess = []
  let writeInProgress = false

  store.subscribe(() => {
    if (paused) return

    const state = store.getState()

    Object.keys(state).forEach((key) => {
      if (!passWhitelistBlacklist(key)) return
      if (lastState[key] === state[key]) return
      if (storesToProcess.indexOf(key) !== -1) return
      storesToProcess.push(key)
    })

    if (!writeInProgress) {
      writeInProgress = true
      const timeIterator = setInterval(() => {
        if (storesToProcess.length === 0) {
          clearInterval(timeIterator)
          writeInProgress = false
          return
        }

        const key = storesToProcess.shift()
        const storageKey = createStorageKey(key)
        const endState = store.getState()[key]
        storage.setItem(storageKey, serializer(endState)).catch(warnIfSetError(key))
      }, 0)
    }

    lastState = state
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

    // Only used in `persistStore`, to force `lastState` to update
    // with the results of `REHYDRATE` even when the persistor is
    // paused.
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
