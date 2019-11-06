/* @flow strict-local */
import { combineReducers } from 'redux';
import type { CombinedReducer, Reducer } from 'redux';
import { enableBatching } from 'redux-batched-actions';

import config from '../config';
import { logSlowReducers } from '../utils/redux';
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
import nav from '../nav/navReducer';
import outbox from '../outbox/outboxReducer';
import presence from '../presence/presenceReducer';
import realm from '../realm/realmReducer';
import session from '../session/sessionReducer';
import settings from '../settings/settingsReducer';
import streams from '../streams/streamsReducer';
import subscriptions from '../subscriptions/subscriptionsReducer';
import topics from '../topics/topicsReducer';
import typing from '../typing/typingReducer';
import unreadHuddles from '../unread/unreadHuddlesReducer';
import unreadMentions from '../unread/unreadMentionsReducer';
import unreadPms from '../unread/unreadPmsReducer';
import unreadStreams from '../unread/unreadStreamsReducer';
import userGroups from '../user-groups/userGroupsReducer';
import userStatus from '../user-status/userStatusReducer';
import users from '../users/usersReducer';

const reducers = {
  migrations: (state: MigrationsState = NULL_OBJECT) => state,
  accounts,
  alertWords,
  caughtUp,
  drafts,
  fetching,
  flags,
  messages,
  narrows,
  mute,
  nav,
  outbox,
  presence,
  realm,
  session,
  settings,
  streams,
  subscriptions,
  topics,
  typing,
  unread: (combineReducers({
    streams: unreadStreams,
    pms: unreadPms,
    huddles: unreadHuddles,
    mentions: unreadMentions,
  }): Reducer<*, Action>),
  userGroups,
  userStatus,
  users,
};

export const ALL_KEYS: string[] = Object.keys(reducers);

const combinedReducer: CombinedReducer<GlobalState, Action> = combineReducers(
  config.enableReduxSlowReducerWarnings ? logSlowReducers(reducers) : reducers,
);

export default enableBatching(combinedReducer);
