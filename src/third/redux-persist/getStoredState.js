/* @flow strict-local */
import invariant from 'invariant';

import type { Config } from './types';
import { KEY_PREFIX } from './constants';
import * as logging from '../../utils/logging';

// TODO(consistent-return): Let's work with Promises instead of callbacks,
//   after these files are covered by Flow.
// eslint-disable-next-line consistent-return
export default function getStoredState(
  config: Config,
  onComplete: (err: mixed, state?: { ... }) => void,
): ?Promise<{ ... }> {
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

    // TODO clean this up
    invariant(allKeys, "allKeys must be set, or we'd have an error by now");

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
        let serialized: null | string = null;
        try {
          serialized = await storage.getItem(createStorageKey(key));
          invariant(serialized !== null, 'key was found above, should be present here');
        } catch (e) {
          err = e;
        }
        if (err) {
          logging.warn(err, {
            message: 'redux-persist/getStoredState: Error restoring data for a key.',
            key,
          });
        } else {
          // TODO clean this up
          invariant(
            serialized !== null,
            "serialized must be set, or else we'd have an error by now",
          );

          restoredState[key] = rehydrate(key, serialized);
        }
        completionCount += 1;
        if (completionCount === restoreCount) {
          onComplete(null, restoredState);
        }
      })();
    });
  })();

  function rehydrate(key: string, serialized: string) {
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

  /* TODO refactor this function, and its caller, to use Promises
       instead of a callback.  Pending that we comment this code out,
       because otherwise it triggers some Flow bug causing weird errors.
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
  */
}
