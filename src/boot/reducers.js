/* @flow strict-local */
import config from '../config';
import { NULL_OBJECT } from '../nullObjects';
import type { Action, GlobalState, MigrationsState } from '../types';

import accounts from '../account/accountsReducer';
import alertWords from '../alertWords/alertWordsReducer';
import caughtUp from '../caughtup/caughtUpReducer';
import drafts from '../drafts/draftsReducer';
import fetching from '../chat/fetchingReducer';
import flags from '../chat/flagsReducer';
import narrows from '../chat/narrowsReducer';
import messages from '../message/messagesReducer';
import mute from '../mute/muteReducer';
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
import userStatus from '../user-status/userStatusReducer';
import users from '../users/usersReducer';
import timing from '../utils/timing';

const migrations = (state: MigrationsState = NULL_OBJECT): MigrationsState => state;

const { enableReduxSlowReducerWarnings, slowReducersThreshold } = config;

function maybeLogSlowReducer(action, key, startMs, endMs) {
  if (endMs - startMs >= slowReducersThreshold) {
    timing.add({ text: `${action.type} @ ${key}`, startMs, endMs });
  }
}

function applyReducer<Key: $Keys<GlobalState>, State>(
  key: Key,
  reducer: (void | State, Action, GlobalState) => State,
  state: void | State,
  action: Action,
  globalState: void | GlobalState,
): State {
  let startMs = undefined;
  if (enableReduxSlowReducerWarnings) {
    startMs = Date.now();
  }

  /* $FlowFixMe - We make a small lie about the type, pretending that
     globalState is not void.

     This is OK because it's only ever void at the initialization action,
     and no reducer should do anything there other than return its initial
     state, so in particular no reducer should even look at globalState.

     Then on the other hand it's helpful because we want each reducer that
     ever does use the globalState parameter to require it -- so that Flow
     can help us be sure to pass it at the reducer's many other call sites,
     in tests.  That means it has to be `globalState: GlobalState`, not
     `globalState : void | GlobalState`.
   */
  const castGlobalState: GlobalState = globalState;

  const nextState = reducer(state, action, castGlobalState);

  if (startMs !== undefined) {
    const endMs = Date.now();
    maybeLogSlowReducer(action, key, startMs, endMs);
  }

  return nextState;
}

// Based on Redux upstream's combineReducers.
export default (state: void | GlobalState, action: Action): GlobalState => {
  // prettier-ignore
  const nextState = {
    migrations: applyReducer('migrations', migrations, state?.migrations, action, state),
    accounts: applyReducer('accounts', accounts, state?.accounts, action, state),
    alertWords: applyReducer('alertWords', alertWords, state?.alertWords, action, state),
    caughtUp: applyReducer('caughtUp', caughtUp, state?.caughtUp, action, state),
    drafts: applyReducer('drafts', drafts, state?.drafts, action, state),
    fetching: applyReducer('fetching', fetching, state?.fetching, action, state),
    flags: applyReducer('flags', flags, state?.flags, action, state),
    messages: applyReducer('messages', messages, state?.messages, action, state),
    narrows: applyReducer('narrows', narrows, state?.narrows, action, state),
    mute: applyReducer('mute', mute, state?.mute, action, state),
    mutedUsers: applyReducer('mutedUsers', mutedUsers, state?.mutedUsers, action, state),
    outbox: applyReducer('outbox', outbox, state?.outbox, action, state),
    pmConversations: applyReducer('pmConversations', pmConversations, state?.pmConversations, action, state),
    presence: applyReducer('presence', presence, state?.presence, action, state),
    realm: applyReducer('realm', realm, state?.realm, action, state),
    session: applyReducer('session', session, state?.session, action, state),
    settings: applyReducer('settings', settings, state?.settings, action, state),
    streams: applyReducer('streams', streams, state?.streams, action, state),
    subscriptions: applyReducer('subscriptions', subscriptions, state?.subscriptions, action, state),
    topics: applyReducer('topics', topics, state?.topics, action, state),
    typing: applyReducer('typing', typing, state?.typing, action, state),
    unread: applyReducer('unread', unread, state?.unread, action, state),
    userGroups: applyReducer('userGroups', userGroups, state?.userGroups, action, state),
    userStatus: applyReducer('userStatus', userStatus, state?.userStatus, action, state),
    users: applyReducer('users', users, state?.users, action, state),
  };

  if (state && Object.keys(nextState).every(key => nextState[key] === state[key])) {
    return state;
  }

  return nextState;
};
