// @flow strict-local

import type { GlobalState } from '../../types';
import { historicalStoreKeys, migrations } from '../migrations';
import { storeKeys } from '../../boot/store';
import { createMigrationFunction } from '../../redux-persist-migrate';
import { ZulipVersion } from '../../utils/zulipVersion';

describe('historicalStoreKeys', () => {
  test('equals current storeKeys', () => {
    // If this test starts failing, we'll want to clone historicalStoreKeys
    // into one with the old value and one with the new.  See comment there.
    expect(historicalStoreKeys).toEqual(storeKeys);
  });
});

describe('migrations', () => {
  const migrate = createMigrationFunction(migrations, 'migrations');

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

  // What `base` becomes after migrations up through 9.
  const base9 = {
    ...base,
    migrations: { version: 9 },
    accounts: [{ ...base.accounts[0], ackedPushToken: null }],
  };

  // What `base` becomes after migrations up through 15.
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

  // What `base` becomes after migrations up through 37.
  const base37 = {
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

  // What `base` becomes after all migrations.
  const endBase = {
    ...base37,
    migrations: { version: 43 },
  };

  for (const [desc, before, after] of [
    // Test the behavior with no migration state, which doesn't apply any
    // of the specific migrations.
    ['empty state -> just store version', {}, { migrations: endBase.migrations }],
    [
      'no migration state -> just store version, leave everything else',
      { nonsense: [1, 2, 3] },
      { migrations: endBase.migrations, nonsense: [1, 2, 3] },
    ],

    // Test the whole sequence all together.  This covers many of the
    // individual migrations.  (This might not be a good design if we were
    // going to be adding more migrations in this sequence; but pretty soon
    // we aren't.)
    ['whole sequence', base, endBase],

    // Test the latest use of `dropCache`.  All the earlier uses are
    // redundant with this one, because none of the migration steps notice
    // whether any properties outside `storeKeys` are present or not.
    [
      'check dropCache at 43',
      { ...endBase, migrations: { version: 42 }, mute: [], nonsense: [1, 2, 3] },
      endBase,
    ],

    //
    // Now test individual migrations further, where needed.
    // Ignore `dropCache`, which we covered above.

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
      {
        ...base15,
        migrations: { version: 21 },
        drafts: { 'pm:d:12:other@example.com': 'text', 'topic:s:general\x00stuff': 'other text' },
      },
      // This migration itself leaves the `topic:` draft in place.  But it
      // gets dropped later by migration 38.
      { ...endBase, drafts: { 'pm:12': 'text' } },
      // NB the original version of this migration was buggy; it would drop
      // the PM drafts entirely, so this test case would end up as:
      //   { ...endBase, drafts: {} }, // WRONG
      // Should have written tests for it the first time. :-)
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
    [
      'check 38',
      {
        ...base37,
        drafts: {
          'topic:s:general\x00stuff': 'text',
          'stream:s:general': 'more text',
          'pm:12': 'pm text',
        },
      },
      { ...endBase, drafts: { 'pm:12': 'pm text' } },
    ],
    [
      'check 39',
      {
        ...base37,
        migrations: { version: 38 },
        drafts: {
          'topic:d:8:general\x00stuff': 'text',
          'stream:d:8:general': 'more text',
          'pm:12': 'pm text',
        },
      },
      {
        ...endBase,
        drafts: { 'topic:8:stuff': 'text', 'stream:8': 'more text', 'pm:12': 'pm text' },
      },
    ],
  ]) {
    /* eslint-disable no-loop-func */
    test(desc, async () => {
      // $FlowIgnore[incompatible-exact]
      // $FlowIgnore[incompatible-type]
      /* $FlowIgnore[prop-missing]
         this really is a lie -- and kind of central to migration */
      const incomingState: $Rest<GlobalState, { ... }> = before;
      expect(migrate(incomingState)).toEqual(after);
    });
  }
});
