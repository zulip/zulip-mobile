/* @flow strict-local */
import { applyMiddleware, compose, createStore } from 'redux';
import type { Store } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { createLogger } from 'redux-logger';
import createActionBuffer from 'redux-action-buffer';
import Immutable from 'immutable';
import { persistStore, autoRehydrate } from '../third/redux-persist';
import type { Config } from '../third/redux-persist';

import { ZulipVersion } from '../utils/zulipVersion';
import { stringify, parse } from './replaceRevive';
import type { Action, GlobalState } from '../types';
import config from '../config';
import { REHYDRATE } from '../actionConstants';
import rootReducer from './reducers';
import ZulipAsyncStorage from './ZulipAsyncStorage';
import createMigration from '../redux-persist-migrate/index';
import { provideLoggingContext } from './loggingContext';
import { tryGetActiveAccount } from '../account/accountsSelectors';
import { objectFromEntries } from '../jsBackport';

if (process.env.NODE_ENV === 'development') {
  // Chrome dev tools for Immutable.
  //
  // To enable, press F1 from the Chrome dev tools to open the
  // settings. In the "Console" section, check "Enable custom
  // formatters".
  //
  // eslint-disable-next-line import/no-extraneous-dependencies, global-require
  const installDevTools = require('immutable-devtools');
  installDevTools(Immutable);
}

// AsyncStorage.clear(); // use to reset storage during development

/**
 * Properties on the global state which we explicitly choose not to persist.
 *
 * All properties on the global Redux state should appear either here or in
 * the lists of properties we do persist, below.
 */
// prettier-ignore
export const discardKeys: Array<$Keys<GlobalState>> = [
  'alertWords', 'caughtUp', 'fetching',
  'presence', 'session', 'topics', 'typing', 'userStatus',
];

/**
 * Properties on the global state which we persist because they are local.
 *
 * These represent information that belongs to this device (and this
 * install of the app), where things wouldn't work right if we didn't
 * persist them.
 */
// prettier-ignore
export const storeKeys: Array<$Keys<GlobalState>> = [
  'migrations', 'accounts', 'drafts', 'outbox', 'settings',
];

/**
 * Properties on the global state which we persist for caching's sake.
 *
 * These represent information for which the ground truth is on the
 * server, but which we persist locally so that we have it cached and
 * don't have to re-download it.
 */
// prettier-ignore
export const cacheKeys: Array<$Keys<GlobalState>> = [
  'flags', 'messages', 'mute', 'narrows', 'pmConversations', 'realm', 'streams',
  'subscriptions', 'unread', 'userGroups', 'users',
];

/**
 * Drop all server data, as a rehydrate-time migration.
 *
 * Most of our data is just copied from the server, and gets routinely
 * discarded any time the event queue expires and we make a new `/register`
 * call.  That's much more frequent than a new app release, let alone one
 * with a data migration... so forcing the same thing in a migration is
 * inexpensive, and makes a simple way to handle most migrations.
 *
 * One important difference from an expired event queue: `DEAD_QUEUE`
 * leaves the stale data mostly in place, to be clobbered by fresh data
 * by the subsequent `REALM_INIT`.  Here, because the old data may not work
 * with the current code at all, we have to actually discard it up front.
 * The behavior is similar to `ACCOUNT_SWITCH`, which also discards most
 * data: we'll show the loading screen while fetching initial data.  See
 * the `REHYDRATE` handlers in `sessionReducer` and `navReducer` for how
 * that happens.
 */
function dropCache(state: GlobalState): $Shape<GlobalState> {
  const result: $Shape<GlobalState> = {};
  storeKeys.forEach(key => {
    /* $FlowFixMe[incompatible-type]: This is well-typed only because
       it's the same `key` twice. */
    result[key] = state[key];
  });
  return result;
}

/**
 * Migrations for data persisted by previous versions of the app.
 *
 * These are run by `redux-persist-migrate` when the previously persisted
 * state is loaded ("rehydrated") by `redux-persist`; they transform that
 * state object before it's applied to our live state.  The state includes
 * a version number to track which migrations are already reflected in it,
 * so that each only has to be run once.
 */
const migrations: { [string]: (GlobalState) => GlobalState } = {
  // The type is a lie, in several ways:
  //  * The actual object contains only the properties we persist:
  //    those in `storeKeys` and `cacheKeys`, but not `discardKeys`.
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
    const { locale } = state.settings;
    const newLocale = newLocaleNames[locale] ?? locale;
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
      // `a.realm` is a string until migration 15
      // $FlowMigrationFudge[prop-missing]
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
      /* $FlowMigrationFudge[incompatible-call]: `a.realm` will be a
         string here */
      realm: new URL(a.realm),
    })),
  }),

  // Convert `narrows` from object-as-map to `Immutable.Map`.
  '16': state => ({
    ...state,
    narrows: Immutable.Map(state.narrows),
  }),

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
      Object.keys(state.drafts)
        .map(key => key.replace(/^pm:d:(.*?):.*/s, 'pm:$1'))
        .map(key => [key, state.drafts[key]]),
    ),
  }),

  // Convert `messages` from object-as-map to `Immutable.Map`.
  '23': dropCache,

  // TIP: When adding a migration, consider just using `dropCache`.
};

/**
 * Return a list of Redux middleware objects to use in our Redux store.
 *
 * See Redux docs on its "middleware API":
 *   https://redux.js.org/api/applymiddleware/
 */
function listMiddleware() {
  const result = [
    // Delay ("buffer") actions until a REHYDRATE action comes through.
    // After dispatching the latter, this will go back and dispatch
    // all the buffered actions.  See docs:
    //   https://github.com/rt2zz/redux-action-buffer
    createActionBuffer(REHYDRATE),

    // Handle the fancy "thunk" actions we often use, i.e. async
    // functions of `dispatch` and `state`.  See docs:
    //   https://github.com/reduxjs/redux-thunk
    thunkMiddleware,
  ];

  if (config.enableReduxLogging) {
    result.push(
      // Log each action to the console -- often handy in development.
      // See upstream docs:
      //   https://github.com/LogRocket/redux-logger
      // and ours:
      //   https://github.com/zulip/zulip-mobile/blob/master/docs/howto/debugging.md#redux-logger
      createLogger({
        duration: true,
        // Example options to add for more focused information, depending on
        // what you're investigating; see docs/howto/debugging.md (link above).
        //   diff: true,
        //   collapsed: true,
        //   collapsed: (getState, action) => action.type !== 'MESSAGE_FETCH_COMPLETE',
        //   predicate: (getState, action) => action.type === 'MESSAGE_FETCH_COMPLETE',
      }),
    );
  }

  return result;
}

/**
 * The Redux store.  We store nearly all application data here.
 *
 * For discussion, see:
 *  * docs/architecture.md
 *  * docs/architecture/realtime.md
 *  * docs/background/recommended-reading.md
 */
const store: Store<GlobalState, Action> = createStore(
  rootReducer,
  undefined,
  compose(
    // Invoke redux-persist-migrate with our migrations.
    createMigration(migrations, 'migrations'),

    // Various middleware; see `listMiddleware`.
    applyMiddleware(...listMiddleware()),

    // Handle all the boring parts of a REHYDRATE action from redux-persist,
    // where the live state just gets filled in with the corresponding parts
    // of the just-loaded state from disk.  See upstream docs:
    //   https://github.com/rt2zz/redux-persist/tree/v4.10.2#autorehydrateconfig
    autoRehydrate(),
  ),
);

provideLoggingContext(() => ({
  serverVersion: tryGetActiveAccount(store.getState())?.zulipVersion ?? null,
}));

/**
 * The config options to pass to redux-persist.
 *
 * See upstream docs:
 *   https://github.com/rt2zz/redux-persist/tree/v4.10.2
 *
 * (Why v4?  We studied v5 and determined it doesn't make sense for us to
 * use because its design choices on migrations don't support some important
 * kinds of migrations. See e5409c578.)
 */
const reduxPersistConfig: Config = {
  // The parts of our state for redux-persist to persist,
  // as keys on the top-level state.
  whitelist: [...storeKeys, ...cacheKeys],

  // Store data through our own wrapper for AsyncStorage, in particular
  // to get compression.
  /* $FlowFixMe[incompatible-variance]:
     https://github.com/rt2zz/redux-persist/issues/823 */
  storage: ZulipAsyncStorage,
  serialize: stringify,
  deserialize: parse,
};

/** Invoke redux-persist.  We do this once at launch. */
export const restore = (onFinished?: () => void) =>
  persistStore(store, reduxPersistConfig, onFinished);

export default store;
