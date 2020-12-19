/* @flow strict-local */
import { enableBatching } from 'redux-batched-actions';

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
  reducer: (void | State, Action) => State,
  state: void | State,
  action: Action,
): State {
  let startMs = undefined;
  if (enableReduxSlowReducerWarnings) {
    startMs = Date.now();
  }

  const nextState = reducer(state, action);

  if (startMs !== undefined) {
    const endMs = Date.now();
    maybeLogSlowReducer(action, key, startMs, endMs);
  }

  return nextState;
}

// Based on Redux upstream's combineReducers.
const combinedReducer = (state: void | GlobalState, action: Action): GlobalState => {
  // prettier-ignore
  const nextState = {
    migrations: applyReducer('migrations', migrations, state?.migrations, action),
    accounts: applyReducer('accounts', accounts, state?.accounts, action),
    alertWords: applyReducer('alertWords', alertWords, state?.alertWords, action),
    caughtUp: applyReducer('caughtUp', caughtUp, state?.caughtUp, action),
    drafts: applyReducer('drafts', drafts, state?.drafts, action),
    fetching: applyReducer('fetching', fetching, state?.fetching, action),
    flags: applyReducer('flags', flags, state?.flags, action),
    messages: applyReducer('messages', messages, state?.messages, action),
    narrows: applyReducer('narrows', narrows, state?.narrows, action),
    mute: applyReducer('mute', mute, state?.mute, action),
    outbox: applyReducer('outbox', outbox, state?.outbox, action),
    pmConversations: applyReducer('pmConversations', pmConversations, state?.pmConversations, action),
    presence: applyReducer('presence', presence, state?.presence, action),
    realm: applyReducer('realm', realm, state?.realm, action),
    session: applyReducer('session', session, state?.session, action),
    settings: applyReducer('settings', settings, state?.settings, action),
    streams: applyReducer('streams', streams, state?.streams, action),
    subscriptions: applyReducer('subscriptions', subscriptions, state?.subscriptions, action),
    topics: applyReducer('topics', topics, state?.topics, action),
    typing: applyReducer('typing', typing, state?.typing, action),
    unread: applyReducer('unread', unread, state?.unread, action),
    userGroups: applyReducer('userGroups', userGroups, state?.userGroups, action),
    userStatus: applyReducer('userStatus', userStatus, state?.userStatus, action),
    users: applyReducer('users', users, state?.users, action),
  };

  if (state && Object.keys(nextState).every(key => nextState[key] === state[key])) {
    return state;
  }

  return nextState;
};

export default enableBatching(combinedReducer);
