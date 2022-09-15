// @flow strict-local
import type { ReadWrite, SubsetProperties } from '../generics';
import { ZulipVersion } from '../utils/zulipVersion';
import type { GlobalState } from '../types';
import { objectFromEntries } from '../jsBackport';

// Like GlobalState, but making all properties optional.
type PartialState = $ReadOnly<$Rest<GlobalState, { ... }>>;

// Like GlobalState, but with only the properties from historicalStoreKeys.
type StoreKeysState = SubsetProperties<
  GlobalState,
  { migrations: mixed, accounts: mixed, drafts: mixed, outbox: mixed, settings: mixed },
>;

// Like GlobalState, but making optional all except historicalStoreKeys.
// This is the type we pretend our migrations take and return.
type LessPartialState = $ReadOnly<{ ...$Rest<GlobalState, { ... }>, ...StoreKeysState }>;

/**
 * Exported only for tests.
 *
 * The value of `storeKeys` when the `dropCache` migrations were written.
 */
// prettier-ignore
export const historicalStoreKeys: $ReadOnlyArray<$Keys<StoreKeysState>> = [
  // Never edit this list.
  'migrations', 'accounts', 'drafts', 'outbox', 'settings',
  // Why never edit?  The existing migrations below that refer to
  // `dropCache` are relying on this continuing to have the same value.
  // So if `storeKeys` changes, we'll need a new separate `dropCache` with
  // the new list, for use in new migrations, while the existing migrations
  // continue to use the existing `dropCache` with this list.
];

/**
 * The value of `cacheKeys` as of migration 24.
 */
// prettier-ignore
export const historicalCacheKeys24: $ReadOnlyArray<$Keys<GlobalState>> = [
  // Never edit this list.
  'flags', 'messages', 'mute', 'narrows', 'pmConversations', 'realm', 'streams',
  'subscriptions', 'unread', 'userGroups', 'users',
  // Why never edit?  Much like for `historicalStoreKeys` above, but in this
  // case this is about a one-off migration we don't expect to repeat.
];

/**
 * Drop all server data, as a rehydrate-time migration.
 *
 * For any change to our Redux state affecting the data we fetch from the
 * server, use this so that we simply re-fetch it from the server.
 *
 * If the change also affects any of the data in `historicalStoreKeys`
 * above, then the migration needs specific code to handle those too;
 * otherwise, `dropCache` suffices as the entire migration.
 *
 * Rationale: Most of our data is just copied from the server, and gets routinely
 * discarded any time the event queue expires and we make a new `/register`
 * call.  That's much more frequent than a new app release, let alone one
 * with a data migration... so forcing the same thing in a migration is
 * inexpensive, and makes a simple way to handle most migrations.
 *
 * One important difference from an expired event queue: `DEAD_QUEUE`
 * leaves the stale data mostly in place, to be clobbered by fresh data
 * by the subsequent `REGISTER_COMPLETE`.  Here, because the old data may not work
 * with the current code at all, we have to actually discard it up front.
 * The behavior is similar to `ACCOUNT_SWITCH`, which also discards most
 * data: we'll show the loading screen while fetching initial data.  See
 * the `REHYDRATE` handlers in `sessionReducer` and `navReducer` for how
 * that happens.
 */
function dropCache(state: LessPartialState): LessPartialState {
  const result: $Shape<ReadWrite<LessPartialState>> = {};
  historicalStoreKeys.forEach(key => {
    // $FlowFixMe[prop-missing]
    /* $FlowFixMe[incompatible-type]
         This is well-typed only because it's the same `key` twice. */
    result[key] = state[key];
  });
  return result;
}

// This is the inward-facing type; see later export for jsdoc.
const migrationsInner: {| [string]: (LessPartialState) => LessPartialState |} = {
  // The type is a lie, in several ways:
  //  * The actual object contains only the properties we persist:
  //    those in `storeKeys` and `cacheKeys`, but not `discardKeys`.
  //  * Conversely, the actual object may be missing some of the expected
  //    properties.  (We skip these migrations entirely if the `migrations`
  //    property is missing, e.g. on first launch.  But with our pre-#4841
  //    unsound storage, a previous run could have managed to store
  //    `migrations` and any subset of the other keys.)
  //  * The actual input is from an older version of the code, one with
  //    different data structures -- after all, that's the point of the
  //    migration -- which usually have a different type.
  //  * For all but the latest migration, the same is true of the output.
  //
  // Still, it seems a more helpful approximation than nothing.  Where the
  // falsehoods show through, we freely tell Flow to ignore them.

  // Example if removing a top-level subtree entirely:
  //   import { AsyncStorage } from 'react-native';
  //   ...
  //   AsyncStorage.removeItem('reduxPersist:messages');

  '6': state => ({
    // This rolls up all previous migrations, to clean up after our bug #3553.
    // Mostly we can just `dropCache`, to reload data from the server...
    ...dropCache(state),
    accounts: state.accounts.map(a => ({
      ...a,
      // but in the case of `ackedPushToken` let's be a bit more precise,
      // and avoid clobbering it if present.  (Don't copy this pattern for a
      // normal migration; this uncertainty is specific to recovering from #3553.)
      ackedPushToken: a.ackedPushToken !== undefined ? a.ackedPushToken : null,
    })),
  }),

  '8': dropCache,

  // Forget any acked push tokens, so we send them again.  This is part of
  // fixing #3695, taking care of any users who were affected before they
  // got the version with the fix.
  '9': state => ({
    ...state,
    accounts: state.accounts.map(a => ({
      ...a,
      ackedPushToken: null,
    })),
  }),

  // Convert old locale names to new, more-specific locale names.
  '10': state => {
    const newLocaleNames = { zh: 'zh-Hans', id: 'id-ID' };
    // $FlowIgnore[prop-missing]: `locale` renamed to `language` in 31
    const { locale } = state.settings;
    const newLocale = newLocaleNames[locale] ?? locale;
    // $FlowIgnore[prop-missing]
    return {
      ...state,
      settings: {
        ...state.settings,
        locale: newLocale,
      },
    };
  },

  // Fixes #3567 for users with cached realm urls with multiple trailing slashes.
  '11': state => ({
    ...state,
    accounts: state.accounts.map(a => ({
      ...a,
      /* $FlowIgnore[prop-missing]: `a.realm` is a string until
           migration 15 */
      realm: a.realm.replace(/\/+$/, ''),
    })),
  }),

  // Add Accounts.zulipVersion, as string | null.
  '12': state => ({
    ...state,
    accounts: state.accounts.map(a => ({
      ...a,
      zulipVersion: null,
    })),
  }),

  // Convert Accounts.zulipVersion from `string | null` to `ZulipVersion | null`.
  '13': state => ({
    ...state,
    accounts: state.accounts.map(a => ({
      ...a,
      zulipVersion: typeof a.zulipVersion === 'string' ? new ZulipVersion(a.zulipVersion) : null,
    })),
  }),

  // Add Accounts.zulipFeatureLevel, as number | null.
  '14': state => ({
    ...state,
    accounts: state.accounts.map(a => ({
      ...a,
      zulipFeatureLevel: null,
    })),
  }),

  // Convert Accounts[].realm from `string` to `URL`
  '15': state => ({
    ...state,
    accounts: state.accounts.map(a => ({
      ...a,
      /* $FlowIgnore[incompatible-call]: `a.realm` will be a string
           here */
      realm: new URL(a.realm),
    })),
  }),

  // Convert `narrows` from object-as-map to `Immutable.Map`.
  '16': dropCache,

  // Convert messages[].avatar_url from `string | null` to `AvatarURL`.
  '17': dropCache,

  // Convert `UserOrBot.avatar_url` from raw server data to
  // `AvatarURL`.
  '18': dropCache,

  // Change format of keys representing narrows: from JSON to our format,
  // then for PM narrows adding user IDs.
  '21': state => ({
    ...dropCache(state),
    // The old format was a rather hairy format that we don't want to
    // permanently keep around the code to parse.  For PMs, there's an
    // extra wrinkle in that any conversion would require using additional
    // information to look up the IDs.  Drafts are inherently short-term,
    // and are already discarded whenever switching between accounts;
    // so we just drop them here.
    drafts: {},
  }),

  // Change format of keys representing PM narrows, dropping emails.
  '22': state => ({
    ...dropCache(state),
    drafts: objectFromEntries(
      Object.keys(state.drafts).map(key =>
        // NB the original version of this migration was buggy; it ended up
        // just dropping drafts outright for PM narrows.  Fortunately that's
        // not all that bad; see 21 above where we chose that same behavior.
        [key.replace(/^pm:d:(.*?):.*/s, 'pm:$1'), state.drafts[key]],
      ),
    ),
  }),

  // Convert `messages` from object-as-map to `Immutable.Map`.
  '23': dropCache,

  // Dummy `dropCache` for #4458.
  // See `purge` call in src/third/redux-persist/persistStore.js.
  '24': dropCache,

  // Convert `unread.streams` from over-the-wire array to `Immutable.Map`.
  '25': dropCache,

  // Rename locale `id-ID` back to `id`.
  '26': state => {
    // $FlowIgnore[prop-missing]: `locale` renamed to `language` in 31
    const { locale } = state.settings;
    const newLocale = locale === 'id-ID' ? 'id' : locale;
    // $FlowIgnore[prop-missing]
    return {
      ...state,
      settings: {
        ...state.settings,
        locale: newLocale,
      },
    };
  },

  // Remove accounts with "in-progress" login state (empty `.email`),
  // after #4491
  '27': state => ({
    ...state,
    accounts: state.accounts.filter(a => a.email !== ''),
  }),

  // Add "open links with in-app browser" setting.
  '28': state => ({
    ...state,
    settings: {
      ...state.settings,
      browser: 'default',
    },
  }),

  // Make `sender_id` on `Outbox` required.
  '29': state => ({
    ...state,
    outbox: state.outbox.filter(o => o.sender_id !== undefined),
  }),

  // Add `doNotMarkMessagesAsRead` in `SettingsState`.
  // (At the time, we used no migration and let this just be handled
  // automatically by merging with the new initial state.  For similar
  // changes today, we use an explicit migration.  See 37 below, which added
  // a migration corresponding to what we would have had here.)

  // Use valid language tag for Portuguese (Portugal)
  // $FlowIgnore[prop-missing]: `locale` renamed to `language` in 31
  '30': state => ({
    ...state,
    settings: {
      ...state.settings,
      locale:
        // $FlowIgnore[prop-missing]
        state.settings.locale === 'pt_PT' ? 'pt-PT' : state.settings.locale,
    },
  }),

  // Rename to `state.settings.language` from `state.settings.locale`.
  '31': state => {
    // $FlowIgnore[prop-missing]: migration fudge
    const { locale: language, ...settingsRest } = state.settings;
    return {
      ...state,
      settings: {
        ...settingsRest,
        language,
      },
    };
  },

  // Switch to zh-TW as a language option instead of zh-Hant.
  '32': state => ({
    ...state,
    settings: {
      ...state.settings,
      language: state.settings.language === 'zh-Hant' ? 'zh-TW' : state.settings.language,
    },
  }),

  // Add Accounts.userId, as UserId | null.
  '33': state => ({
    ...state,
    accounts: state.accounts.map(a => ({
      ...a,
      userId: null,
    })),
  }),

  // Add mandatoryTopics to RealmState.
  // (At the time, we used no migration and let this just be handled
  // automatically by merging with the new initial state.  For similar
  // changes today, we use an explicit migration.  See 37 below, which added
  // a `dropCache` migration corresponding to what we would have had here.)

  // Drop server data from before Accounts had userId.  This way we have an
  // invariant that if there's server data, then the active Account has userId.
  '34': dropCache,

  // Make `stream_id` on `StreamOutbox` required.
  '35': state => ({
    ...state,
    outbox: state.outbox.filter(o => o.type === 'private' || o.stream_id !== undefined),
  }),

  // Add messageContentDeleteLimitSeconds and messageContentEditLimitSeconds
  // to RealmState.
  // (At the time, we used no migration and let this just be handled
  // automatically by merging with the new initial state.  For similar
  // changes today, we use an explicit migration.  See 37 below, which added
  // a `dropCache` migration corresponding to what we would have had here.)

  // Add pushNotificationsEnabled to RealmState.
  // (At the time, we used no migration and let this just be handled
  // automatically by merging with the new initial state.  For similar
  // changes today, we use an explicit migration.  See 37 below, which added
  // a `dropCache` migration corresponding to what we would have had here.)

  // Add `accounts[].lastDismissedServerPushSetupNotice`, as Date | null.
  '36': state => ({
    ...state,
    accounts: state.accounts.map(a => ({ ...a, lastDismissedServerPushSetupNotice: null })),
  }),

  // Add name and description to RealmState.
  // (At the time, we used no migration and let this just be handled
  // automatically by merging with the new initial state.  For similar
  // changes today, we use an explicit migration.  See 37 below, which added
  // a `dropCache` migration corresponding to what we would have had here.)

  // Handle explicitly the migrations above (before 30, 34, 36, and this
  // one) that were done implicitly by the behavior of `autoRehydrate` on a
  // REHYDRATE action.
  /* $FlowIgnore[prop-missing]: `doNotMarkMessagesAsRead` renamed to
     `markMessagesReadOnScroll` in 52 */
  '37': state => ({
    // This handles the migrations affecting RealmState, before 34, 36, and here.
    ...dropCache(state),
    // Handle the migration before 30.
    settings: {
      ...state.settings,
      /* $FlowIgnore[prop-missing]: `doNotMarkMessagesAsRead` renamed to
         `markMessagesReadOnScroll` in 52 */
      doNotMarkMessagesAsRead: state.settings.doNotMarkMessagesAsRead ?? false,
    },
  }),

  // Change format of keys representing stream and topic narrows, adding IDs.
  '38': state => ({
    ...state,
    drafts: objectFromEntries(
      // Just drop drafts for stream and topic narrows, for the same reasons
      // as for PM narrows in migration 21 above.
      Object.keys(state.drafts)
        .filter(key => !key.startsWith('stream:') && !key.startsWith('topic:'))
        .map(key => [key, state.drafts[key]]),
    ),
  }),

  // Change format of keys representing stream/topic narrows, dropping names.
  '39': state => ({
    ...state,
    drafts: objectFromEntries(
      Object.keys(state.drafts).map(key => [
        key
          .replace(/^stream:d:(\d+):.*/s, 'stream:$1')
          .replace(/^topic:d:(\d+):.*?\x00(.*)/s, 'topic:$1:$2'),
        state.drafts[key],
      ]),
    ),
  }),

  // Change `state.mute` data structure: was an array with stream names.
  '40': dropCache,

  // Add is_web_public to Stream and Subscription.
  '41': dropCache,

  // Add webPublicStreamsEnabled, enableSpectatorAccess, and
  // createWebPublicStreamPolicy to state.realm.
  '42': dropCache,

  // Add isOwner and isModerator to state.realm.
  '43': dropCache,

  // Add isGuest to state.realm.
  '44': dropCache,

  // Add createPublicStreamPolicy and createPrivateStreamPolicy to state.realm.
  '45': dropCache,

  // Add waitingPeriodThreshold to state.realm.
  '46': dropCache,

  // Add displayEmojiReactionUsers to state.realm.
  '47': dropCache,

  // Add customProfileFields to state.realm.
  '48': dropCache,

  // Add defaultExternalAccounts to state.realm.
  '49': dropCache,

  // Add allowEditHistory to state.realm.
  '50': dropCache,

  // Add serverEmojiData to state.realm.
  '51': dropCache,

  // Change boolean doNotMarkMessagesAsRead to enum markMessagesReadOnScroll
  '52': state => {
    // $FlowIgnore[prop-missing]
    const { doNotMarkMessagesAsRead, ...restSettings } = state.settings;
    return {
      ...state,
      settings: {
        ...restSettings,
        markMessagesReadOnScroll: (doNotMarkMessagesAsRead: boolean) ? 'never' : 'always',
      },
    };
  },

  // Add enableReadReceipts to state.realm.
  '53': dropCache,

  // TIP: When adding a migration, consider just using `dropCache`.
  //   (See its jsdoc for guidance on when that's the right answer.)
};

/**
 * Migrations for data persisted by previous versions of the app.
 *
 * These are run by `redux-persist-migrate` when the previously persisted
 * state is loaded ("rehydrated") by `redux-persist`; they transform that
 * state object before it's applied to our live state.  The state includes
 * a version number to track which migrations are already reflected in it,
 * so that each only has to be run once.
 */
/* $FlowFixMe[incompatible-type] This discrepancy between PartialState
     (which the exported type claims to accept) and LessPartialState (the
     type actually accepted by the implementation, migrationsInner) is where
     we pretend that the storeKeys are all present. */
export const migrations: {| [string]: (PartialState) => PartialState |} = migrationsInner;
