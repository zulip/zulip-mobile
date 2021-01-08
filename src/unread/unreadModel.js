/* @flow strict-local */
import { combineReducers, type Reducer } from 'redux';

import type { Action, UnreadState } from '../types';
import unreadStreamsReducer from './unreadStreamsReducer';
import unreadPmsReducer from './unreadPmsReducer';
import unreadHuddlesReducer from './unreadHuddlesReducer';
import unreadMentionsReducer from './unreadMentionsReducer';

export const reducer: Reducer<UnreadState, Action> = combineReducers({
  streams: unreadStreamsReducer,
  pms: unreadPmsReducer,
  huddles: unreadHuddlesReducer,
  mentions: unreadMentionsReducer,
});
