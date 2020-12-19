/* @flow strict-local */
import type { CombinedReducer } from 'redux';
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
  outbox,
  pmConversations,
  presence,
  realm,
  session,
  settings,
  streams,
  subscriptions,
  topics,
  typing,
  unread,
  userGroups,
  userStatus,
  users,
};

export const ALL_KEYS: string[] = Object.keys(reducers);

// Inlined just now from Redux upstream.
// We'll clean this up in the next few commits.
/* eslint-disable semi */
/* eslint-disable no-shadow */
// prettier-ignore
const combinedReducer: CombinedReducer<GlobalState, Action> = (reducers => {
  const reducerKeys = Object.keys(reducers)

  return function combination(state = {}, action) {
    let hasChanged = false
    const nextState = {}
    for (let i = 0; i < reducerKeys.length; i++) {
      const key = reducerKeys[i]
      const reducer = reducers[key]
      // $FlowFixMe
      const previousStateForKey = state[key]
      // $FlowFixMe
      const nextStateForKey = reducer(previousStateForKey, action)
      nextState[key] = nextStateForKey
      hasChanged = hasChanged || nextStateForKey !== previousStateForKey
    }
    // $FlowFixMe -- errors from those empty object literals
    return hasChanged ? nextState : state
  }
})(
  config.enableReduxSlowReducerWarnings ? logSlowReducers(reducers) : reducers,
);

export default enableBatching(combinedReducer);
