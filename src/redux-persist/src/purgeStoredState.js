import { KEY_PREFIX } from './constants';
import { logErrorRemotely } from '../../utils/logging';

function warnIfRemoveError(key) {
  return function removeError(err) {
    if (err && process.env.NODE_ENV !== 'production') {
      logErrorRemotely(new Error(`Error storing data for key: ${key}, ${err}`));
    }
  };
}

export default function purgeStoredState(config, keys) {
  const { storage } = config;
  const keyPrefix = config.keyPrefix !== undefined ? config.keyPrefix : KEY_PREFIX;

  // basic validation
  if (Array.isArray(config)) {
    throw new Error(
      'redux-persist: purgeStoredState requires config as a first argument (found array). An array of keys is the optional second argument.',
    );
  }
  if (!storage) {
    throw new Error('redux-persist: config.storage required in purgeStoredState');
  }

  if (typeof keys === 'undefined') {
    // if keys is not defined, purge all keys
    return new Promise((resolve, reject) => {
      storage.getAllKeys((err, allKeys) => {
        if (err) {
          if (process.env.NODE_ENV !== 'production') {
            logErrorRemotely(
              new Error('redux-persist: error during purgeStoredState in storage.getAllKeys'),
            );
          }
          reject(err);
        } else {
          resolve(
            purgeStoredState(
              config,
              allKeys
                .filter(key => key.indexOf(keyPrefix) === 0)
                .map(key => key.slice(keyPrefix.length)),
            ),
          );
        }
      });
    });
  }
  // otherwise purge specified keys
  return Promise.all(
    keys.map(key => storage.removeItem(`${keyPrefix}${key}`, warnIfRemoveError(key))),
  );
}
