/* @flow strict-local */
import type { MuteState, Action } from '../types';
import { REALM_INIT, ACCOUNT_SWITCH, EVENT_MUTED_TOPICS } from '../actionConstants';
import { NULL_ARRAY } from '../nullObjects';

const initialState: MuteState = NULL_ARRAY;

const realmInit = (state, action) => action.data.muted_topics || initialState;

const eventMutedTopics = (state, action) => action.muted_topics;

export default (state: MuteState = initialState, action: Action): MuteState => {
  switch (action.type) {
    case ACCOUNT_SWITCH:
      return initialState;

    case REALM_INIT:
      return realmInit(state, action);

    case EVENT_MUTED_TOPICS:
      return eventMutedTopics(state, action);

    default:
      return state;
  }
};
