/* @flow strict-local */
import type { MuteState, Action } from '../types';
import { REALM_INIT, ACCOUNT_SWITCH, EVENT_MUTED_TOPICS } from '../actionConstants';
import { NULL_ARRAY } from '../nullObjects';

const initialState: MuteState = NULL_ARRAY;

export default (state: MuteState = initialState, action: Action): MuteState => {
  switch (action.type) {
    case ACCOUNT_SWITCH:
      return initialState;

    case REALM_INIT:
      return action.data.muted_topics || initialState;

    case EVENT_MUTED_TOPICS:
      return action.muted_topics;

    default:
      return state;
  }
};
