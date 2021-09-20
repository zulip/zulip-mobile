/* @flow strict-local */
import type { Store } from 'redux';

import type { GlobalSelector, GlobalState, Action } from './reduxTypes';

/**
 * Call a function whenever a selected piece of state changes.
 *
 * When the return value of `select` isn't equal (===) to the previous
 * value, `onChange` gets called, with the old and new value.
 * `onChange` is called once, immediately and unconditionally, at the
 * beginning.
 *
 * Returns a teardown function.
 */
export function observeStore<T>(
  store: Store<GlobalState, Action>,
  select: GlobalSelector<T>,
  onChange: (state: T) => void,
): () => void {
  // Start as a nonce object, so the initial `prevState !== state`
  // must return true.
  let prevState = {};

  function handleChange() {
    const state = select(store.getState());
    if (prevState !== state) {
      onChange(state);
      prevState = state;
    }
  }

  const unsubscribe = store.subscribe(handleChange);
  handleChange();
  return unsubscribe;
}
