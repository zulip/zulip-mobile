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
  let lastWrittenState = {}
  let paused = false
  let writeInProgress = false

  store.subscribe(() => {
    if (paused || writeInProgress) return;

    writeOnce(store.getState());
  })

  /**
   * Update the storage to the given state.
   *
   * The storage is assumed to already reflect `lastWrittenState`.
   * On completion, sets `lastWrittenState` to `state`.
   */
  async function writeOnce(state) {
    writeInProgress = true

    // Atomically collect the subtrees that need to be written out.
    const updatedSubstates = [];
    for (const key of Object.keys(state)) {
      if (!passWhitelistBlacklist(key)) {
        continue;
      }
      if (state[key] === lastWrittenState[key]) {
        continue;
      }
      updatedSubstates.push([key, state[key]]);
    }

    // Serialize those subtrees, with yields after each one.
    const writes = []
    for (const [key, substate] of updatedSubstates) {
      writes.push([key, serializer(substate)])
      await new Promise(r => setTimeout(r, 0));
    }

    if (writes.length > 0) { // `multiSet` doesn't like an empty array
      try {
        // Warning: not guaranteed to be done in a transaction.
        await storage.multiSet(
          writes.map(([key, serializedSubstate]) => [createStorageKey(key), serializedSubstate])
        )
      } catch (e) {
        warnIfSetError(writes.map(([key, _]) => key))(e)
        throw e
      }
    }

    writeInProgress = false
    lastWrittenState = state
  }

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
     * Set `lastWrittenState` to the current `store.getState()`.
     *
     * Only to be used in `persistStore`, to force `lastWrittenState` to
     * update with the results of `REHYDRATE` even when the persistor is
     * paused.
     *
     * If this is going to be called, it should be before any writes have
     * begun. Otherwise it may not be effective; see
     *   https://github.com/zulip/zulip-mobile/pull/4694#discussion_r691739007.
     */
    _resetLastWrittenState: () => { lastWrittenState = store.getState() }
  }
}

function warnIfSetError (keys) {
  return function setError (err) {
    if (err) {
      logging.warn(
        err,
        {
          message: 'An error was encountered while trying to persist this set of keys',
          keys
        }
      );
    }
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
