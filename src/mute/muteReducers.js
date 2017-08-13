/* @flow */
import isEqual from 'lodash.isequal';

import type { MuteState, Action } from '../types';
import { REALM_INIT, ACCOUNT_SWITCH, EVENT_MUTED_TOPICS } from '../actionConstants';

const initialState: MuteState = [];

export default (state: MuteState = initialState, action: Action): MuteState => {
  switch (action.type) {
    case REALM_INIT:
      return isEqual(action.data.muted_topics, state) ? state : action.data.muted_topics;
    case ACCOUNT_SWITCH:
      return initialState;
    case EVENT_MUTED_TOPICS:
      return action.muted_topics;
    default:
      return state;
  }
};
