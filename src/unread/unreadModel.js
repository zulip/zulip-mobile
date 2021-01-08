/* @flow strict-local */
import { combineReducers, type Reducer } from 'redux';

import type { Action } from '../actionTypes';
import type {
  UnreadState,
  UnreadPmsState,
  UnreadHuddlesState,
  UnreadMentionsState,
  UnreadStreamsState,
} from './unreadModelTypes';
import type { GlobalState } from '../reduxTypes';
import unreadStreamsReducer from './unreadStreamsReducer';
import unreadPmsReducer from './unreadPmsReducer';
import unreadHuddlesReducer from './unreadHuddlesReducer';
import unreadMentionsReducer from './unreadMentionsReducer';

export const getUnreadStreams = (state: GlobalState): UnreadStreamsState => state.unread.streams;

export const getUnreadPms = (state: GlobalState): UnreadPmsState => state.unread.pms;

export const getUnreadHuddles = (state: GlobalState): UnreadHuddlesState => state.unread.huddles;

export const getUnreadMentions = (state: GlobalState): UnreadMentionsState => state.unread.mentions;

export const reducer: Reducer<UnreadState, Action> = combineReducers({
  streams: unreadStreamsReducer,
  pms: unreadPmsReducer,
  huddles: unreadHuddlesReducer,
  mentions: unreadMentionsReducer,
});
