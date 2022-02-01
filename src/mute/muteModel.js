/* @flow strict-local */
import type { MuteState, PerAccountApplicableAction, PerAccountState } from '../types';
import { REGISTER_COMPLETE, LOGOUT, ACCOUNT_SWITCH, EVENT_MUTED_TOPICS } from '../actionConstants';
import { NULL_ARRAY } from '../nullObjects';

//
//
// Selectors.
//

export const getMute = (state: PerAccountState): MuteState => state.mute;

//
//
// Getters.
//

export const isTopicMuted = (stream: string, topic: string, mute: MuteState): boolean =>
  mute.some(x => x[0] === stream && x[1] === topic);

//
//
// Reducer.
//

const initialState: MuteState = NULL_ARRAY;

export const reducer = (
  state: MuteState = initialState,
  action: PerAccountApplicableAction,
): MuteState => {
  switch (action.type) {
    case LOGOUT:
    case ACCOUNT_SWITCH:
      return initialState;

    case REGISTER_COMPLETE:
      return action.data.muted_topics || initialState;

    case EVENT_MUTED_TOPICS:
      return action.muted_topics;

    default:
      return state;
  }
};
