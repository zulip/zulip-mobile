/* @flow strict-local */
import Immutable from 'immutable';
import { createSelector } from 'reselect';

import type { Action } from '../actionTypes';
import type {
  UnreadState,
  UnreadPmsState,
  UnreadHuddlesState,
  UnreadMentionsState,
} from './unreadModelTypes';
import type { GlobalState } from '../reduxTypes';
import type { Selector } from '../types';
import unreadStreamsReducer from './unreadStreamsReducer';
import unreadPmsReducer from './unreadPmsReducer';
import unreadHuddlesReducer from './unreadHuddlesReducer';
import unreadMentionsReducer from './unreadMentionsReducer';

export const getUnreadStreams: Selector<
  Immutable.Map<number, Immutable.Map<string, Immutable.List<number>>>,
> = createSelector(
  state => state.unread.streams,
  data => {
    // prettier-ignore
    // This is an example of the style-guide rule "Always provide a type
    // when writing an empty `Immutable` value".  Without the explicit type,
    // `result` gets inferred as `Immutable.Map<number, empty>`, and then
    // e.g. the `setIn` call could be completely wrong and the type-checker
    // wouldn't notice.
    const result: Immutable.Map<number, Immutable.Map<string, Immutable.List<number>>> =
      Immutable.Map().asMutable();
    for (const { stream_id, topic, unread_message_ids } of data) {
      result.setIn([stream_id, topic], Immutable.List(unread_message_ids));
    }
    return result.asImmutable();
  },
);

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
