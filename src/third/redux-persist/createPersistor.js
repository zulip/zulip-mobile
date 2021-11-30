import invariant from 'invariant';

import * as logging from '../../utils/logging';
import { KEY_PREFIX } from './constants';
import purgeStoredState from './purgeStoredState';

export default function createPersistor(store, config) {
  // defaults
  const serializer = config.serialize;
  const whitelist = config.whitelist;
  const keyPrefix = config.keyPrefix !== undefined ? config.keyPrefix : KEY_PREFIX;

  const storage = config.storage;

  let paused = false;
  let writeInProgress = false;

  // This is the last state we've attempted to write out.
  let lastWrittenState = {};

  // These are the keys for which we have a failed, or not yet completed,
  // write since the last successful write.
  const outstandingKeys = new Set();

  store.subscribe(() => {
    if (paused) {
      return;
    }

    write();
  });

  async function write() {
    // Take the lock…
    if (writeInProgress) {
      return;
    }
    writeInProgress = true;
    try {
      // … and immediately enter a try/finally to release it.

      // Then yield so the `subscribe` callback can promptly return.
      await new Promise(r => setTimeout(r, 0));

      let state = undefined;
      // eslint-disable-next-line no-cond-assign
      while ((state = store.getState()) !== lastWrittenState) {
        await writeOnce(state);
      }
    } finally {
      // Release the lock, so the next `subscribe` callback will start the
      // loop again.
      writeInProgress = false;
    }
  }

  /**
   * Update the storage to the given state.
   *
   * The storage is assumed to already reflect `lastWrittenState`.
   * On completion, sets `lastWrittenState` to `state`.
   *
   * This function must not be called concurrently.  The caller is
   * responsible for taking an appropriate lock.
   */
  async function writeOnce(state) {
    // Identify what keys we need to write.
    // This includes anything already in outstandingKeys, because we don't
    // know what value was last successfully stored for those.
    for (const key of Object.keys(state)) {
      if (whitelist.indexOf(key) === -1) {
        continue;
      }
      if (state[key] === lastWrittenState[key]) {
        continue;
      }
      outstandingKeys.add(key);
    }
    lastWrittenState = state;

    if (outstandingKeys.size === 0) {
      // `multiSet` doesn't like an empty array, so return early.
      return;
    }

    // Serialize those keys' subtrees, with yields after each one.
    const writes = [];
    for (const key of outstandingKeys) {
      writes.push([createStorageKey(key), serializer(state[key])]);
      await new Promise(r => setTimeout(r, 0));
    }

    // Write them all out, in one `storage.multiSet` operation.
    invariant(writes.length > 0, 'should have nonempty writes list');
    try {
      // Warning: not guaranteed to be done in a transaction.
      await storage.multiSet(writes);
    } catch (e) {
      logging.warn(e, {
        message: 'An error was encountered while trying to persist this set of keys',
        keys: [...outstandingKeys.values()],
      });
      throw e;
    }

    // Record success.
    outstandingKeys.clear();
  }

  function createStorageKey(key) {
    return `${keyPrefix}${key}`;
  }

  // return `persistor`
  return {
    pause: () => {
      paused = true;
    },
    resume: () => {
      paused = false;
    },
    purge: keys => purgeStoredState({ storage, keyPrefix }, keys),

    /**
     * Set `lastWrittenState` to the current `store.getState()`.
     *
     * Only to be used in `persistStore`, to force `lastWrittenState` to
     * update with the results of `REHYDRATE` even when the persistor is
     * paused.
     */
    _resetLastWrittenState: () => {
      lastWrittenState = store.getState();
    },
  };
}
