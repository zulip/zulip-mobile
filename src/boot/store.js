/* @flow strict-local */
import { applyMiddleware, compose, createStore } from 'redux';
import type { Store } from 'redux';
// $FlowFixMe[untyped-import]
import thunkMiddleware from 'redux-thunk';
// $FlowFixMe[untyped-import]
import { createLogger } from 'redux-logger';
// $FlowFixMe[untyped-import]
import createActionBuffer from 'redux-action-buffer';
import Immutable from 'immutable';
import { persistStore, autoRehydrate } from '../third/redux-persist';
import type { Config, Persistor } from '../third/redux-persist';

import { stringify, parse } from '../storage/replaceRevive';
import type { Action, GlobalState, ThunkExtras } from '../types';
import config from '../config';
import { REHYDRATE } from '../actionConstants';
import rootReducer from './reducers';
import CompressedAsyncStorage from '../storage/CompressedAsyncStorage';
import createMigration from '../redux-persist-migrate/index';
import { getGlobalSession, getGlobalSettings } from '../directSelectors';
import { migrations } from '../storage/migrations';

if (process.env.NODE_ENV === 'development') {
  // Chrome dev tools for Immutable.
  //
  // To enable, press F1 from the Chrome dev tools to open the
  // settings. In the "Console" section, check "Enable custom
  // formatters".
  //
  // $FlowFixMe[untyped-import]
  const installDevTools = require('immutable-devtools'); // eslint-disable-line import/no-extraneous-dependencies, global-require
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
export const discardKeys: $ReadOnlyArray<$Keys<GlobalState>> = [
  'alertWords', 'caughtUp', 'fetching',
  'presence', 'session', 'topics', 'typing', 'userStatuses',
];

/**
 * Properties on the global state which we persist because they are local.
 *
 * These represent information that belongs to this device (and this
 * install of the app), where things wouldn't work right if we didn't
 * persist them.
 */
// prettier-ignore
export const storeKeys: $ReadOnlyArray<$Keys<GlobalState>> = [
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
export const cacheKeys: $ReadOnlyArray<$Keys<GlobalState>> = [
  'flags', 'messages', 'mute', 'mutedUsers', 'narrows', 'pmConversations',
  'realm', 'streams', 'subscriptions', 'unread', 'userGroups', 'users',
];

const thunkExtras: ThunkExtras = {
  // eslint-disable-next-line no-use-before-define
  getGlobalSession: () => getGlobalSession(store.getState()),

  // eslint-disable-next-line no-use-before-define
  getGlobalSettings: () => getGlobalSettings(store.getState()),
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
    thunkMiddleware.withExtraArgument(thunkExtras),
  ];

  if (config.enableReduxLogging) {
    result.push(
      // Log each action to the console -- often handy in development.
      // See upstream docs:
      //   https://github.com/LogRocket/redux-logger
      // and ours:
      //   https://github.com/zulip/zulip-mobile/blob/main/docs/howto/debugging.md#redux-logger
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
// TODO: Represent thunk actions, etc.
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
    autoRehydrate({ log: true }),
  ),
);

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
  storage: CompressedAsyncStorage,
  serialize: stringify,
  deserialize: parse,
};

/** Invoke redux-persist.  We do this once at launch. */
export const restore = (onFinished?: () => void): Persistor =>
  persistStore(store, reduxPersistConfig, onFinished);

export default store;
