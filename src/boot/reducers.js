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

const reducerKeys = Object.keys(reducers);

const { enableReduxSlowReducerWarnings, slowReducersThreshold } = config;

function maybeLogSlowReducer(action, key, startMs, endMs) {
  if (endMs - startMs >= slowReducersThreshold) {
    timing.add({ text: `${action.type} @ ${key}`, startMs, endMs });
  }
}

// Inlined just now from Redux upstream.
// We'll clean this up in the next few commits.
const combinedReducer = (state: void | GlobalState, action: Action): GlobalState => {
  let hasChanged = false;
  const nextState = {};
  for (let i = 0; i < reducerKeys.length; i++) {
    const key = reducerKeys[i];
    const reducer = reducers[key];
    const previousStateForKey = state?.[key];

    let startMs = undefined;
    if (enableReduxSlowReducerWarnings) {
      startMs = Date.now();
    }

    // $FlowFixMe -- works because reducer and previousStateForKey are from same key
    const nextStateForKey = reducer(previousStateForKey, action);

    if (startMs !== undefined) {
      const endMs = Date.now();
      maybeLogSlowReducer(action, key, startMs, endMs);
    }

    nextState[key] = nextStateForKey;
    hasChanged = hasChanged || nextStateForKey !== previousStateForKey;
  }
  // $FlowFixMe -- works because we didn't mix up keys above
  return hasChanged ? nextState : state;
};

export default enableBatching(combinedReducer);
