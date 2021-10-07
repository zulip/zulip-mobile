import * as logging from '../../utils/logging';

import { KEY_PREFIX } from './constants';

export default function purgeStoredState(config, keys) {
  const storage = config.storage;
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
      (async () => {
        let err = null;
        let allKeys = undefined;
        try {
          allKeys = await storage.getAllKeys();
        } catch (e) {
          err = e;
        }
        if (err) {
          logging.warn(err, {
            message: 'redux-persist: error during purgeStoredState in storage.getAllKeys',
          });
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
      })();
    });
  } else {
    // otherwise purge specified keys
    return Promise.all(
      keys.map(async key => {
        try {
          return await storage.removeItem(`${keyPrefix}${key}`);
        } catch (err) {
          warnIfRemoveError(key)(err);
          throw err;
        }
      }),
    );
  }
}

function warnIfRemoveError(key) {
  return function removeError(err) {
    if (err) {
      logging.warn(err, { message: 'Error storing data for a key.', key });
    }
  };
}
