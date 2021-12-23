// @flow strict-local

import invariant from 'invariant';
import objectEntries from '../../utils/objectEntries';
import { Migration } from '../AsyncStorage';
import { CompressedAsyncStorageImpl } from '../CompressedAsyncStorage';
import { parse, stringify } from '../replaceRevive';
import { migrationLegacyRollup } from '../migrations';
import { objectFromEntries } from '../../jsBackport';

// These are copied from the implementation.
const reduxPersistKeyPrefix = 'reduxPersist:';
const encodeKey = k => `${reduxPersistKeyPrefix}${k}`;
const decodeKey = k => k.slice(reduxPersistKeyPrefix.length);
const deserializer = parse;
const serializer = stringify;

describe('migrationLegacyRollup', () => {
  const baseStorage = new CompressedAsyncStorageImpl(1, [new Migration(0, 1, async () => {})]);

  beforeAll(() => baseStorage.devWipe());
  afterEach(() => baseStorage.devWipe());

  async function prep(state: { ... }) {
    await baseStorage.multiSet(objectEntries(state).map(([k, v]) => [encodeKey(k), serializer(v)]));
  }

  async function fetch(): Promise<{ ... }> {
    const storage = new CompressedAsyncStorageImpl(2, [
      new Migration(0, 1, async () => {}),
      migrationLegacyRollup,
    ]);
    const keys = await storage.getAllKeys();
    const pairs = await Promise.all(
      keys.map(async k => {
        expect(k).toStartWith(reduxPersistKeyPrefix);
        const v = await storage.getItem(k);
        invariant(v != null, 'just saw item; should be present');
        return [decodeKey(k), deserializer(v)];
      }),
    );
    return objectFromEntries(pairs);
  }

  test('empty -> empty-except-migrations', async () => {
    await prep({});
    expect(await fetch()).toEqual({ migrations: { version: 37 } });
  });

  test('no migration state -> clear other state', async () => {
    await prep({ nonsense: [1, 2, 3] });
    expect(await fetch()).toEqual({ migrations: { version: 37 } });
  });

  test('0 -> ??', async () => {
    await prep({ migrations: { version: 0 }, foo: 1 });
    expect(await fetch()).toEqual({ migrations: { version: 37 } });
  });
});
