/* @flow strict-local */
import type { MuteState, PerAccountApplicableAction } from '../types';
import { REGISTER_COMPLETE, LOGOUT, ACCOUNT_SWITCH, EVENT_MUTED_TOPICS } from '../actionConstants';
import { NULL_ARRAY } from '../nullObjects';

const initialState: MuteState = NULL_ARRAY;

export default (state: MuteState = initialState, action: PerAccountApplicableAction): MuteState => {
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
