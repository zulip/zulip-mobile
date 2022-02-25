/* @flow strict-local */
import config from '../config';
import type { Action, PerAccountApplicableAction, GlobalState, MigrationsState } from '../types';
import { dubPerAccountState } from '../reduxTypes';
import { isPerAccountApplicableAction } from '../actionTypes';

import accounts from '../account/accountsReducer';
import alertWords from '../alertWords/alertWordsReducer';
import caughtUp from '../caughtup/caughtUpReducer';
import drafts from '../drafts/draftsReducer';
import fetching from '../chat/fetchingReducer';
import flags from '../chat/flagsReducer';
import narrows from '../chat/narrowsReducer';
import messages from '../message/messagesReducer';
import { reducer as mute } from '../mute/muteModel';
import mutedUsers from '../mute/mutedUsersReducer';
import outbox from '../outbox/outboxReducer';
import { reducer as pmConversations } from '../pm-conversations/pmConversationsModel';
import presence from '../presence/presenceReducer';
import realm from '../realm/realmReducer';
import session from '../session/sessionReducer';
import settings from '../settings/settingsReducer';
import streams from '../streams/streamsReducer';
import subscriptions from '../subscriptions/subscriptionsReducer';
import topics from '../topics/topicsReducer';
import typing from '../typing/typingReducer';
import { reducer as unread } from '../unread/unreadModel';
import userGroups from '../user-groups/userGroupsReducer';
import { reducer as userStatuses } from '../user-statuses/userStatusesModel';
import users from '../users/usersReducer';
import timing from '../utils/timing';

// The `Object.freeze` is to work around a Flow issue:
//   https://github.com/facebook/flow/issues/2386#issuecomment-695064325
const migrations = (state: MigrationsState = Object.freeze({})): MigrationsState => state;

const { enableReduxSlowReducerWarnings, slowReducersThreshold } = config;

function maybeLogSlowReducer(action, key: $Keys<GlobalState>, startMs, endMs) {
  if (endMs - startMs >= slowReducersThreshold) {
    timing.add({ text: `${action.type} @ ${key}`, startMs, endMs });
  }
}

/**
 * Apply a sub-reducer, with perf logging if enabled.
 *
 * The `globalState` argument is the "global" state relative to this
 * sub-reducer: so type GS is `GlobalState` for a global reducer, and
 * `PerAccountState` for a per-account reducer.
 */
function applyReducer<GS, A: Action, Key: $Keys<GS> & $Keys<GlobalState>, State>(
  key: Key,
  reducer: (void | State, A, GS) => State,
  state: void | State,
  action: A,
  globalState: void | GS,
): State {
  let startMs = undefined;
  if (enableReduxSlowReducerWarnings) {
    startMs = Date.now();
  }

  /* $FlowFixMe[incompatible-type] - We make a small lie about the type,
     pretending that globalState is not void.

     This is OK because it's only ever void at the initialization action,
     and no reducer should do anything there other than return its initial
     state, so in particular no reducer should even look at globalState.

     Then on the other hand it's helpful because we want each reducer that
     ever does use the globalState parameter to require it -- so that Flow
     can help us be sure to pass it at the reducer's many other call sites,
     in tests.  That means it has to be `globalState: GS`, not
     `globalState : void | GS`.
   */
  const castGlobalState: GS = globalState;

  const nextState = reducer(state, action, castGlobalState);

  if (startMs !== undefined) {
    const endMs = Date.now();
    maybeLogSlowReducer((action: Action), key, startMs, endMs);
  }

  return nextState;
}

// Based on Redux upstream's combineReducers.
export default (globalState: void | GlobalState, origAction: Action): GlobalState => {
  let nextPerAccountState = globalState;
  if (!nextPerAccountState) {
    // Initialize the per-account state.  This must be the store
    // initialization action, because the previous state is void.

    /* $FlowFixMe[incompatible-type]:  */
    const action: PerAccountApplicableAction = origAction;

    // prettier-ignore
    nextPerAccountState = {
      alertWords: applyReducer('alertWords', alertWords, undefined, action, undefined),
      caughtUp: applyReducer('caughtUp', caughtUp, undefined, action, undefined),
      drafts: applyReducer('drafts', drafts, undefined, action, undefined),
      fetching: applyReducer('fetching', fetching, undefined, action, undefined),
      flags: applyReducer('flags', flags, undefined, action, undefined),
      messages: applyReducer('messages', messages, undefined, action, undefined),
      narrows: applyReducer('narrows', narrows, undefined, action, undefined),
      mute: applyReducer('mute', mute, undefined, action, undefined),
      mutedUsers: applyReducer('mutedUsers', mutedUsers, undefined, action, undefined),
      outbox: applyReducer('outbox', outbox, undefined, action, undefined),
      pmConversations: applyReducer('pmConversations', pmConversations, undefined, action, undefined),
      presence: applyReducer('presence', presence, undefined, action, undefined),
      realm: applyReducer('realm', realm, undefined, action, undefined),
      streams: applyReducer('streams', streams, undefined, action, undefined),
      subscriptions: applyReducer('subscriptions', subscriptions, undefined, action, undefined),
      topics: applyReducer('topics', topics, undefined, action, undefined),
      typing: applyReducer('typing', typing, undefined, action, undefined),
      unread: applyReducer('unread', unread, undefined, action, undefined),
      userGroups: applyReducer('userGroups', userGroups, undefined, action, undefined),
      userStatuses: applyReducer('userStatuses', userStatuses, undefined, action, undefined),
      users: applyReducer('users', users, undefined, action, undefined),
    };
  } else if (isPerAccountApplicableAction(origAction)) {
    // Update the per-account state, for this PerAccountApplicableAction.

    /* $FlowFixMe[incompatible-type]: TODO teach Flow that
           isPerAccountApplicableAction checks this */
    const action: PerAccountApplicableAction = origAction;
    let state = dubPerAccountState(nextPerAccountState);

    // prettier-ignore
    state = {
      /* $FlowFixMe[not-an-object]: TODO(#5006) this fixme should go away
           when PerAccountState is no longer opaque */
      ...state,
      alertWords: applyReducer('alertWords', alertWords, state.alertWords, action, state),
      caughtUp: applyReducer('caughtUp', caughtUp, state.caughtUp, action, state),
      drafts: applyReducer('drafts', drafts, state.drafts, action, state),
      fetching: applyReducer('fetching', fetching, state.fetching, action, state),
      flags: applyReducer('flags', flags, state.flags, action, state),
      messages: applyReducer('messages', messages, state.messages, action, state),
      narrows: applyReducer('narrows', narrows, state.narrows, action, state),
      // mute is below
      mutedUsers: applyReducer('mutedUsers', mutedUsers, state.mutedUsers, action, state),
      outbox: applyReducer('outbox', outbox, state.outbox, action, state),
      pmConversations: applyReducer('pmConversations', pmConversations, state.pmConversations, action, state),
      presence: applyReducer('presence', presence, state.presence, action, state),
      realm: applyReducer('realm', realm, state.realm, action, state),
      streams: applyReducer('streams', streams, state.streams, action, state),
      subscriptions: applyReducer('subscriptions', subscriptions, state.subscriptions, action, state),
      topics: applyReducer('topics', topics, state.topics, action, state),
      typing: applyReducer('typing', typing, state.typing, action, state),
      unread: applyReducer('unread', unread, state.unread, action, state),
      userGroups: applyReducer('userGroups', userGroups, state.userGroups, action, state),
      userStatuses: applyReducer('userStatuses', userStatuses, state.userStatuses, action, state),
      users: applyReducer('users', users, state.users, action, state),
    };

    // mute must come after streams, for REGISTER_COMPLETE events
    state.mute = applyReducer('mute', mute, state.mute, action, state);

    nextPerAccountState = state;
  }

  const state = globalState;
  const action = origAction;

  // prettier-ignore
  const nextState = {
    ...nextPerAccountState,

    // TODO(#5006): These mix together per-account and global state.
    session: applyReducer('session', session, state?.session, action, state),
    settings: applyReducer('settings', settings, state?.settings, action, state),

    // All other state.
    migrations: applyReducer('migrations', migrations, state?.migrations, action, state),
    accounts: applyReducer('accounts', accounts, state?.accounts, action, state),
  };

  if (state && Object.keys(nextState).every(key => nextState[key] === state[key])) {
    return state;
  }

  return nextState;
};
