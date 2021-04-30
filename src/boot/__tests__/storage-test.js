/* @flow strict-local */
import invariant from 'invariant';

import * as eg from '../../__tests__/lib/exampleData';
import objectEntries from '../../utils/objectEntries';
import type { GlobalState } from '../../types';
import ZulipAsyncStorage from '../ZulipAsyncStorage';
import { stringify, parse } from '../replaceRevive';

const getRoundTrippedStateValue = async <K: $Keys<GlobalState>, V: $Values<GlobalState>>(
  key: K,
  value: V,
): Promise<V> => {
  // 1: Serialize a "live" object; e.g., a ZulipVersion instance.
  const stringifiedValue = stringify(value);

  // 2: Write to storage. Parts of this are mocked; so, stress-test
  // those mocks:
  //    - Compression via TextCompressionModule on Android
  //    - AsyncStorage: the library provides a mock implementation
  //      that writes to a variable instead of to the disk
  await ZulipAsyncStorage.setItem(key, stringifiedValue);

  // 3: Read from storage. Parts of this are mocked; so, stress-test
  // those mocks:
  //    - Decompression via TextCompressionModule on Android
  //    - AsyncStorage: the library provides a mock implementation
  //      that reads from a variable instead of from the disk
  const valueFromStorage = await ZulipAsyncStorage.getItem(key);
  invariant(valueFromStorage != null, 'valueFromStorage is not null/undefined');

  // 4: "revive", e.g., a ZulipVersion instance.
  const parsedValueFromStorage = parse(valueFromStorage);

  // $FlowIgnore[incompatible-cast]
  return (parsedValueFromStorage: V);
};

const getRoundTrippedState = async (globalState: GlobalState): Promise<GlobalState> => {
  const entries = await Promise.all(
    objectEntries(globalState).map(
      // eslint-disable-next-line flowtype/generic-spacing
      async <K: $Keys<GlobalState>, V: $Values<GlobalState>>([key: K, value: V]): Promise<
        [K, V],
      > => [
        // $FlowIgnore[incompatible-cast]
        (key: K),
        // $FlowIgnore[incompatible-cast]
        (await getRoundTrippedStateValue(key, value): V),
      ],
    ),
  );
  // $FlowIgnore[incompatible-indexer]
  return Object.fromEntries(entries);
};

/**
 * Test several pieces of the Redux storage logic at once.
 *
 * We're counting on a lot of our Redux state to round-trip through
 * storage. Jest can't realistically test everything in this process
 * -- in particular, the storage itself, and any native code involved
 * -- but, in the places where it can't, at least it can stress-test
 * the mocks we've written and use elsewhere, to make sure they're
 * reasonably faithful.
 *
 * `eg.plusReduxState` represents standard example data, though not
 * the entire range of possible data; see its jsdoc. Still, we'll want
 * to know about any failures to round-trip that arise from changes to
 * that.
 */
test('`eg.plusReduxState` round-trips through storage', async () => {
  const stateBefore = eg.plusReduxState;
  // The `GlobalState` annotation seems to guide Flow to better error
  // messages; without it, Flow seems to get confused by the `await`.
  const stateAfter: GlobalState = await getRoundTrippedState(stateBefore);

  // `AvatarURL` instances are generally lazy with their `new URL`
  // computations; they have a stateful piece that might be a string
  // or a `URL` object. We could figure out how to teach Jest that
  // that difference doesn't matter, but for now, just normalize both
  // states by "waking up" their `AvatarURL`s.
  [stateBefore, stateAfter].forEach(s => {
    s.users.forEach(u => u.avatar_url.get(100));
    s.messages.forEach(m => m.avatar_url.get(100));
  });

  expect(stateAfter).toEqual(stateBefore);
});
