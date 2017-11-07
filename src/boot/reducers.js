/* @flow */
import { combineReducers } from 'redux';
import { enableBatching } from 'redux-batched-actions';

import config from '../config';
import { logSlowReducers } from '../utils/redux';

import accounts from '../account/accountReducers';
import alertWords from '../alertWords/alertWordsReducer';
import app from '../app/appReducers';
import caughtUp from '../caughtup/caughtUpReducers';
import chat from '../chat/chatReducers';
import fetching from '../chat/fetchingReducers';
import flags from '../chat/flagsReducers';
import mute from '../mute/muteReducers';
import nav from '../nav/navReducers';
import realm from '../realm/realmReducers';
import outbox from '../outbox/outboxReducers';
import drafts from '../drafts/draftsReducers';
import settings from '../settings/settingsReducers';
import streams from '../streams/streamsReducers';
import subscriptions from '../subscriptions/subscriptionsReducers';
import topics from '../topics/topicsReducers';
import typing from '../typing/typingReducers';
import unreadStreams from '../unread/unreadStreamsReducers';
import unreadPms from '../unread/unreadPmsReducers';
import unreadHuddles from '../unread/unreadHuddlesReducers';
import unreadMentions from '../unread/unreadMentionsReducers';
import users from '../users/usersReducers';
import presence from '../presence/presenceReducers';

const reducers = {
  accounts,
  alertWords,
  app,
  caughtUp,
  chat,
  fetching,
  drafts,
  flags,
  mute,
  nav,
  presence,
  realm,
  outbox,
  settings,
  streams,
  subscriptions,
  topics,
  typing,
  unread: combineReducers({
    streams: unreadStreams,
    pms: unreadPms,
    huddles: unreadHuddles,
    mentions: unreadMentions,
  }),
  users,
};

export default enableBatching(
  combineReducers(config.enableReduxSlowReducerWarnings ? logSlowReducers(reducers) : reducers),
);
