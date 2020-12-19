/* @flow strict-local */

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

export const reducer = (
  state: void | UnreadState,
  action: Action,
  globalState: GlobalState,
): UnreadState => {
  const nextState = {
    streams: unreadStreamsReducer(state?.streams, action, globalState),
    pms: unreadPmsReducer(state?.pms, action),
    huddles: unreadHuddlesReducer(state?.huddles, action),
    mentions: unreadMentionsReducer(state?.mentions, action),
  };

  if (state && Object.keys(nextState).every(key => nextState[key] === state[key])) {
    return state;
  }

  return nextState;
};
