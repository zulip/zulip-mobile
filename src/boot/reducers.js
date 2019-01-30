/* @flow strict-local */
import { combineReducers } from 'redux';
import type { CombinedReducer, Reducer } from 'redux';
import { enableBatching } from 'redux-batched-actions';

import config from '../config';
import { logSlowReducers } from '../utils/redux';
import { NULL_OBJECT } from '../nullObjects';
import type { Action, GlobalState, MigrationsState } from '../types';

import accounts from '../account/accountsReducers';
import alertWords from '../alertWords/alertWordsReducer';
import caughtUp from '../caughtup/caughtUpReducers';
import drafts from '../drafts/draftsReducers';
import fetching from '../chat/fetchingReducers';
import flags from '../chat/flagsReducers';
import loading from '../loading/loadingReducers';
import narrows from '../chat/narrowsReducers';
import messages from '../message/messagesReducers';
import mute from '../mute/muteReducers';
import nav from '../nav/navReducers';
import outbox from '../outbox/outboxReducers';
import presence from '../presence/presenceReducers';
import realm from '../realm/realmReducers';
import session from '../session/sessionReducers';
import settings from '../settings/settingsReducers';
import streams from '../streams/streamsReducers';
import subscriptions from '../subscriptions/subscriptionsReducers';
import topics from '../topics/topicsReducers';
import typing from '../typing/typingReducers';
import unreadHuddles from '../unread/unreadHuddlesReducers';
import unreadMentions from '../unread/unreadMentionsReducers';
import unreadPms from '../unread/unreadPmsReducers';
import unreadStreams from '../unread/unreadStreamsReducers';
import userGroups from '../user-groups/userGroupsReducers';
import userStatus from '../user-status/userStatusReducers';
import users from '../users/usersReducers';

const reducers = {
  migrations: (state: MigrationsState = NULL_OBJECT) => state,
  accounts,
  alertWords,
  caughtUp,
  drafts,
  fetching,
  flags,
  loading,
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
