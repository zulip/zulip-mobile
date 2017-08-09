/* @flow */
import { combineReducers } from 'redux';

import type { Action, GlobalState } from './types';
import { BATCH_ACTIONS } from './actionConstants';
import accounts from './account/accountReducers';
import alertWords from './alertWords/alertWordsReducer';
import app from './app/appReducers';
import chat from './chat/chatReducers';
import flags from './chat/flagsReducers';
import mute from './mute/muteReducers';
import nav from './nav/navReducers';
import realm from './realm/realmReducers';
import outbox from './outbox/outboxReducers';
import settings from './settings/settingsReducers';
import streams from './streams/streamsReducers';
import subscriptions from './subscriptions/subscriptionsReducers';
import typing from './typing/typingReducers';
import unreadStreams from './unread/unreadStreamsReducers';
import unreadPms from './unread/unreadPmsReducers';
import unreadHuddles from './unread/unreadHuddlesReducers';
import unreadMentions from './unread/unreadMentionsReducers';
import users from './users/usersReducers';
import presence from './presence/presenceReducers';

// Thanks to https://twitter.com/dan_abramov/status/656074974533459968?lang=en
const enableBatching = reducer => (state: GlobalState, action: Action) => {
  switch (action.type) {
    case BATCH_ACTIONS:
      return action.actions.reduce(reducer, state);
    default:
      return reducer(state, action);
  }
};

export default enableBatching(
  combineReducers({
    accounts,
    alertWords,
    app,
    chat,
    flags,
    mute,
    nav,
    presence,
    realm,
    outbox,
    settings,
    streams,
    subscriptions,
    typing,
    unread: combineReducers({
      streams: unreadStreams,
      pms: unreadPms,
      huddles: unreadHuddles,
      mentions: unreadMentions,
    }),
    users,
  }),
);
