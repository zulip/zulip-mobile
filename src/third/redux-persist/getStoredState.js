/* @flow strict-local */
import invariant from 'invariant';

import type { Config } from './types';
import { KEY_PREFIX } from './constants';
import * as logging from '../../utils/logging';
import { allSettled } from '../../jsBackport';

export default async function getStoredState(config: Config): Promise<{ ... }> {
  const storage = config.storage;
  const deserializer = config.deserialize;
  const whitelist = config.whitelist;
  const keyPrefix = config.keyPrefix !== undefined ? config.keyPrefix : KEY_PREFIX;

  let allKeys = undefined;
  try {
    allKeys = await storage.getAllKeys();
  } catch (err) {
    logging.warn(err, { message: 'redux-persist/getStoredState: Error in storage.getAllKeys' });
    throw err;
  }

  const persistKeys = allKeys
    .filter(key => key.indexOf(keyPrefix) === 0)
    .map(key => key.slice(keyPrefix.length));
  const keysToRestore = persistKeys.filter(key => whitelist.indexOf(key) !== -1);

  const restoredState = {};
  await allSettled(
    keysToRestore.map(key =>
      (async () => {
        let serialized = undefined;
        try {
          serialized = await storage.getItem(createStorageKey(key));
        } catch (err) {
          logging.warn(err, {
            message: 'redux-persist/getStoredState: Error restoring data for a key.',
            key,
          });
          return;
        }
        invariant(serialized !== null, 'key was found above, should be present here');
        restoredState[key] = rehydrate(key, serialized);
      })(),
    ),
  );
  return restoredState;

  function rehydrate(key: string, serialized: string) {
    try {
      return deserializer(serialized);
    } catch (err) {
      logging.warn(err, {
        message: 'redux-persist/getStoredState: Error restoring data for a key.',
        key,
      });
      return null;
    }
  }

  function createStorageKey(key) {
    return `${keyPrefix}${key}`;
  }
}
