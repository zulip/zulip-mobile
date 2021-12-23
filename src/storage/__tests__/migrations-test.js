// @flow strict-local

import invariant from 'invariant';
import objectEntries from '../../utils/objectEntries';
import { Migration } from '../AsyncStorage';
import { CompressedAsyncStorageImpl, type CompressedMigration } from '../CompressedAsyncStorage';
import { parse, stringify } from '../replaceRevive';
import {
  migrationLegacyRollup,
  WIP_migrationAccountId as migrationAccountId,
  WIP_migrationSplitSettings as migrationSplitSettings,
} from '../migrations';
import { objectFromEntries } from '../../jsBackport';
import { ZulipVersion } from '../../utils/zulipVersion';

const baseStorage = new CompressedAsyncStorageImpl(0, []);

describe('migrations where one top-level subtree is still exactly one key', () => {
  // These are copied from the implementation.
  const reduxPersistKeyPrefix = 'reduxPersist:';
  const encodeKey = k => `${reduxPersistKeyPrefix}${k}`;
  const decodeKey = k => k.slice(reduxPersistKeyPrefix.length);
  const deserializer = parse;
  const serializer = stringify;

  beforeAll(() => baseStorage.devWipe());
  afterEach(() => baseStorage.devWipe());

  async function prep(state: { ... }) {
    await baseStorage.multiSet(objectEntries(state).map(([k, v]) => [encodeKey(k), serializer(v)]));
  }

  async function fetchAfter(migration: Migration | CompressedMigration): Promise<{ ... }> {
    const baseMigrations = [...Array(migration.startVersion).keys()].map(
      i => new Migration(i, i + 1, async () => {}),
    );
    const storage = new CompressedAsyncStorageImpl(migration.endVersion, [
      ...baseMigrations,
      migration,
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

  // A plausible-ish state from before all surviving migrations.
  const base3 = {
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

  // What `base3` becomes after legacy migrations up through 9.
  const base9 = {
    ...base3,
    migrations: { version: 9 },
    accounts: [{ ...base3.accounts[0], ackedPushToken: null }],
  };

  // What `base3` becomes after legacy migrations up through 15.
  const base15 = {
    ...base9,
    migrations: { version: 15 },
    accounts: [
      {
        ...base9.accounts[0],
        realm: new URL('https://chat.example'),
        zulipFeatureLevel: null,
        zulipVersion: null,
      },
    ],
  };

  // What `base3` becomes after all legacy migrations.
  const endBase = {
    migrations: { version: 37 },
    accounts: [
      {
        ...base15.accounts[0],
        lastDismissedServerPushSetupNotice: null,
        userId: null,
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

  describe('migrationLegacyRollup', () => {
    for (const [desc, before, after] of [
      // Test the behavior with no migration state, which doesn't apply any
      // of the specific migrations.
      ['empty state -> just store version', {}, { migrations: { version: 37 } }],
      [
        'no migration state -> just clear and store version',
        { nonsense: [1, 2, 3] },
        { migrations: { version: 37 } },
      ],

      // Test the whole sequence all together.  This covers many of the
      // individual migrations.  (This might not be a good design if we were
      // going to be adding more migrations in this sequence; but we aren't.)
      ['whole sequence', base3, endBase],

      //
      // Now test individual migrations further, where needed.

      // 6 is redundant with 9
      // 9 covered by whole
      [
        'check 10 with locale zh',
        // with locale id, 10 gets reverted by 26
        { ...base9, settings: { ...base9.settings, locale: 'zh' } },
        { ...endBase, settings: { ...endBase.settings, language: 'zh-Hans' } },
      ],
      // 12 covered by whole
      [
        'check 13',
        {
          ...base9,
          migrations: { version: 12 },
          accounts: [{ ...base9.accounts[0], zulipVersion: '1.2.3' }],
        },
        {
          ...endBase,
          accounts: [{ ...endBase.accounts[0], zulipVersion: new ZulipVersion('1.2.3') }],
        },
      ],
      // 14 covered by whole
      // 15 covered by whole
      // 21 covered by whole
      [
        'check 22',
        { ...base15, migrations: { version: 21 }, drafts: { 'pm:d:12:other@example.com': 'text' } },
        // Should be this:
        //   { ...endBase, drafts: { 'pm:12': 'text' } }, // FAILS
        // But this migration is buggy!  Should have written tests in the first place.
        // Instead we get:
        { ...endBase, drafts: {} }, // WRONG
        // TODO reflect that in the migration.  (Too late for fixing it to be
        //   of much use.)
      ],
      [
        'check 26',
        { ...base15, settings: { ...base15.settings, locale: 'id-ID' } },
        { ...endBase, settings: { ...endBase.settings, language: 'id' } },
      ],
      [
        'check 27',
        { ...base15, accounts: [{ ...base15.accounts[0], email: '' }] },
        { ...endBase, accounts: [] },
      ],
      // 28 covered by whole
      [
        'check 29 with outbox-message that does have sender_id',
        { ...base15, outbox: [{ ...base15.outbox[0], sender_id: 345 }] },
        { ...endBase, outbox: [{ ...base15.outbox[0], sender_id: 345 }] },
      ],
      [
        'check 30',
        { ...base15, settings: { ...base15.settings, locale: 'pt_PT' } },
        { ...endBase, settings: { ...endBase.settings, language: 'pt-PT' } },
      ],
      // 31 covered by whole
      [
        'check 32',
        { ...base15, settings: { ...base15.settings, locale: 'zh-Hant' } },
        { ...endBase, settings: { ...endBase.settings, language: 'zh-TW' } },
      ],
      // 33 covered by whole
      [
        'check 35 with missing stream_id',
        { ...base15, outbox: [{ ...base15.outbox[0], type: 'stream', sender_id: 345 }] },
        { ...endBase, outbox: [] },
      ],
      [
        'check 35 with stream_id present',
        {
          ...base15,
          outbox: [{ ...base15.outbox[0], type: 'stream', sender_id: 345, stream_id: 17 }],
        },
        {
          ...endBase,
          outbox: [{ ...base15.outbox[0], type: 'stream', sender_id: 345, stream_id: 17 }],
        },
      ],
      // 36 covered by whole
      [
        'check 37 with setting already false',
        { ...base15, settings: { ...base15.settings, doNotMarkMessagesAsRead: false } },
        { ...endBase, settings: { ...endBase.settings, doNotMarkMessagesAsRead: false } },
      ],
      [
        'check 37 with setting already true',
        { ...base15, settings: { ...base15.settings, doNotMarkMessagesAsRead: true } },
        { ...endBase, settings: { ...endBase.settings, doNotMarkMessagesAsRead: true } },
      ],
    ]) {
      test(desc, async () => {
        await prep(before);
        expect(await fetchAfter(migrationLegacyRollup)).toEqual(after);
      });
    }
  });

  const base = endBase;

  test('migrationSplitSettings', async () => {
    await prep(base);
    const { settings, ...rest } = base;
    expect(await fetchAfter(migrationSplitSettings)).toEqual({
      ...rest,
      globalSettings: settings,
      perAccountSettings: settings,
    });
  });

  test('migrationAccountId', async () => {
    await prep(base);
    expect(await fetchAfter(migrationAccountId)).toEqual({
      ...base,
      // TODO test with multiple accounts
      accounts: [{ ...base.accounts[0], accountId: 1 }],
    });
  });
});
