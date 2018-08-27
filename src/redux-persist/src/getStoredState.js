import { KEY_PREFIX } from './constants';
import createAsyncLocalStorage from './defaults/asyncLocalStorage';
import { logErrorRemotely } from '../../utils/logging';

function defaultDeserializer(serial) {
  return JSON.parse(serial);
}

export default function getStoredState(config, onComplete) {
  let storage = config.storage || createAsyncLocalStorage('local');
  const deserializer = config.serialize === false ? data => data : defaultDeserializer;
  const blacklist = config.blacklist || [];
  const whitelist = config.whitelist || false;
  const transforms = config.transforms || [];
  const keyPrefix = config.keyPrefix !== undefined ? config.keyPrefix : KEY_PREFIX;

  // fallback getAllKeys to `keys` if present (LocalForage compatability)
  if (storage.keys && !storage.getAllKeys) {
    storage = { ...storage, getAllKeys: storage.keys };
  }

  const restoredState = {};
  let completionCount = 0;

  function rehydrate(key, serialized) {
    let state = null;

    try {
      const data = deserializer(serialized);
      state = transforms.reduceRight(
        (subState, transformer) => transformer.out(subState, key),
        data,
      );
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') {
        logErrorRemotely(
          new Error(`redux-persist/getStoredState: Error restoring data for key: ${key} ${err}`),
        );
      }
    }

    return state;
  }

  function complete(err, _restoredState) {
    onComplete(err, _restoredState);
  }

  function passWhitelistBlacklist(key) {
    if (whitelist && whitelist.indexOf(key) === -1) {
      return false;
    }
    if (blacklist.indexOf(key) !== -1) {
      return false;
    }
    return true;
  }

  function createStorageKey(key) {
    return `${keyPrefix}${key}`;
  }

  storage.getAllKeys((err, allKeys) => {
    if (err) {
      if (process.env.NODE_ENV !== 'production') {
        logErrorRemotely(new Error('redux-persist/getStoredState: Error in storage.getAllKeys'));
      }
      complete(err);
    }

    const persistKeys = allKeys
      .filter(key => key.indexOf(keyPrefix) === 0)
      .map(key => key.slice(keyPrefix.length));
    const keysToRestore = persistKeys.filter(passWhitelistBlacklist);

    const restoreCount = keysToRestore.length;
    if (restoreCount === 0) {
      complete(null, restoredState);
    }
    keysToRestore.forEach(key => {
      storage.getItem(createStorageKey(key), (_err, serialized) => {
        if (_err && process.env.NODE_ENV !== 'production') {
          logErrorRemotely(
            new Error(`redux-persist/getStoredState: Error restoring data for key: ${key} ${err}`),
          );
        } else {
          restoredState[key] = rehydrate(key, serialized);
        }
        completionCount += 1;
        if (completionCount === restoreCount) {
          complete(null, restoredState);
        }
      });
    });
  });

  if (typeof onComplete !== 'function' && !!Promise) {
    return new Promise((resolve, reject) => {
      onComplete = (err, _restoredState) => {
        if (err) {
          reject(err);
        } else {
          resolve(_restoredState);
        }
      };
    });
  }
  return undefined;
}
