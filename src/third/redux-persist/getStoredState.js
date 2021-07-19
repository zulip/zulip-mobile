import * as logging from '../../utils/logging';

import { KEY_PREFIX } from './constants'

export default function getStoredState (config, onComplete) {
  let storage = config.storage
  let deserializer;
  if (config.deserialize === false) {
    deserializer = (data) => data
  } else if (typeof config.deserialize === 'function') {
    deserializer = config.deserialize
  } else {
    deserializer = defaultDeserializer
  }
  const whitelist = config.whitelist
  const keyPrefix = config.keyPrefix !== undefined ? config.keyPrefix : KEY_PREFIX

  let restoredState = {}
  let completionCount = 0;

  (async () => {
    let err = null;
    let allKeys = undefined;
    try {
      allKeys = await storage.getAllKeys()
    } catch (e) {
      err = e
    }

    if (err) {
      logging.warn(err, { message: 'redux-persist/getStoredState: Error in storage.getAllKeys' })
      complete(err)
      return
    }

    let persistKeys = allKeys.filter((key) => key.indexOf(keyPrefix) === 0).map((key) => key.slice(keyPrefix.length))
    let keysToRestore = persistKeys.filter((key) => whitelist.indexOf(key) !== -1)

    let restoreCount = keysToRestore.length
    if (restoreCount === 0) complete(null, restoredState)
    keysToRestore.forEach((key) => {
      (async () => {
        let err = null;
        let serialized = null;
        try {
          serialized = await storage.getItem(createStorageKey(key))
        } catch (e) {
          err = e
        }
        if (err) logging.warn(err, { message: 'redux-persist/getStoredState: Error restoring data for a key.', key})
        else restoredState[key] = rehydrate(key, serialized)
        completionCount += 1
        if (completionCount === restoreCount) complete(null, restoredState)
      })()
    })
  })();

  function rehydrate (key, serialized) {
    let state = null

    try {
      let data = deserializer(serialized)
      state = data
    } catch (err) {
      logging.warn(err, { message: 'redux-persist/getStoredState: Error restoring data for a key.', key })
    }

    return state
  }

  function complete (err, restoredState) {
    onComplete(err, restoredState)
  }

  function createStorageKey (key) {
    return `${keyPrefix}${key}`
  }

  if (typeof onComplete !== 'function' && !!Promise) {
    return new Promise((resolve, reject) => {
      onComplete = (err, restoredState) => {
        if (err) reject(err)
        else resolve(restoredState)
      }
    })
  }
}

function defaultDeserializer (serial) {
  return JSON.parse(serial)
}
