/* @flow */
import { combineReducers } from 'redux';
import { enableBatching } from 'redux-batched-actions';

import config from '../config';
import { logSlowReducers } from '../utils/redux';

import accounts from '../account/accountReducers';
import alertWords from '../alertWords/alertWordsReducer';
import caughtUp from '../caughtup/caughtUpReducers';
import drafts from '../drafts/draftsReducers';
import fetching from '../chat/fetchingReducers';
import flags from '../chat/flagsReducers';
import loading from '../loading/loadingReducers';
import messages from '../chat/chatReducers';
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
import users from '../users/usersReducers';

const reducers = {
  accounts,
  alertWords,
  caughtUp,
  drafts,
  fetching,
  flags,
  loading,
  messages,
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
  unread: combineReducers({
    streams: unreadStreams,
    pms: unreadPms,
    huddles: unreadHuddles,
    mentions: unreadMentions,
  }),
  userGroups,
  users,
};

export const ALL_KEYS: string[] = Object.keys(reducers);

export default enableBatching(
  combineReducers(config.enableReduxSlowReducerWarnings ? logSlowReducers(reducers) : reducers),
);
