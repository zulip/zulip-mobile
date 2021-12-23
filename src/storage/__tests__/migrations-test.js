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

  // A plausible-ish state from before all surviving migrations.
  const base = {
    // Include something non-empty for each of the storeKeys.
    migrations: { version: 3 },
    accounts: [{ email: 'me@example.com', api_key: '1234', realm: 'https://chat.example' }],
    drafts: { '[]': 'draft text' },
    // Real Outbox values have more properties, but fudge that.
    outbox: [{ isOutbox: true, isSent: false, type: 'private' }],
    // Settings from their reducer's initial value at this version.
    settings: {
      locale: 'en',
      theme: 'default',
      offlineNotification: true,
      onlineNotification: true,
      experimentalFeaturesEnabled: false,
      streamNotification: false,
    },
    // Include something extraneous, too.
    foo: 1,
  };

  const endBase = {
    migrations: { version: 37 },
    accounts: [
      {
        email: 'me@example.com',
        api_key: '1234',
        // realm converted
        realm: new URL('https://chat.example'),
        // added:
        ackedPushToken: null,
        lastDismissedServerPushSetupNotice: null,
        userId: null,
        zulipFeatureLevel: null,
        zulipVersion: null,
      },
    ],
    drafts: {}, // cleared
    outbox: [], // cleared of lacking sender_id
    settings: {
      language: 'en', // renamed from locale
      theme: 'default',
      offlineNotification: true,
      onlineNotification: true,
      experimentalFeaturesEnabled: false,
      streamNotification: false,
      // added:
      browser: 'default',
      doNotMarkMessagesAsRead: false,
    },
  };

  // Exercises migration 10.

  for (const [desc, before, after] of [
    ['whole sequence', base, endBase],
    [
      'check 10 with locale zh',
      { ...base, settings: { ...base.settings, locale: 'zh' } },
      { ...endBase, settings: { ...endBase.settings, language: 'zh-Hans' } },
    ],
  ]) {
    test(desc, async () => {
      await prep(before);
      expect(await fetch()).toEqual(after);
    });
  }
});
