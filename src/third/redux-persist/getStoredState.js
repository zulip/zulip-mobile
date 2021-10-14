import * as logging from '../../utils/logging';

import { KEY_PREFIX } from './constants';

// TODO(consistent-return): Let's work with Promises instead of callbacks,
//   after these files are covered by Flow.
// eslint-disable-next-line consistent-return
export default function getStoredState(config, onComplete) {
  const storage = config.storage;
  const deserializer = config.deserialize;
  const whitelist = config.whitelist;
  const keyPrefix = config.keyPrefix !== undefined ? config.keyPrefix : KEY_PREFIX;

  const restoredState = {};
  let completionCount = 0;

  (async () => {
    let err = null;
    let allKeys = undefined;
    try {
      allKeys = await storage.getAllKeys();
    } catch (e) {
      err = e;
    }

    if (err) {
      logging.warn(err, { message: 'redux-persist/getStoredState: Error in storage.getAllKeys' });
      onComplete(err);
      return;
    }

    const persistKeys = allKeys
      .filter(key => key.indexOf(keyPrefix) === 0)
      .map(key => key.slice(keyPrefix.length));
    const keysToRestore = persistKeys.filter(key => whitelist.indexOf(key) !== -1);

    const restoreCount = keysToRestore.length;
    if (restoreCount === 0) {
      onComplete(null, restoredState);
    }
    keysToRestore.forEach(key => {
      (async () => {
        let err = null;
        let serialized = null;
        try {
          serialized = await storage.getItem(createStorageKey(key));
        } catch (e) {
          err = e;
        }
        if (err) {
          logging.warn(err, {
            message: 'redux-persist/getStoredState: Error restoring data for a key.',
            key,
          });
        } else {
          restoredState[key] = rehydrate(key, serialized);
        }
        completionCount += 1;
        if (completionCount === restoreCount) {
          onComplete(null, restoredState);
        }
      })();
    });
  })();

  function rehydrate(key, serialized) {
    let state = null;

    try {
      const data = deserializer(serialized);
      state = data;
    } catch (err) {
      logging.warn(err, {
        message: 'redux-persist/getStoredState: Error restoring data for a key.',
        key,
      });
    }

    return state;
  }

  function createStorageKey(key) {
    return `${keyPrefix}${key}`;
  }

  if (typeof onComplete !== 'function' && !!Promise) {
    return new Promise((resolve, reject) => {
      onComplete = (err, restoredState) => {
        if (err) {
          reject(err);
        } else {
          resolve(restoredState);
        }
      };
    });
  }
}
