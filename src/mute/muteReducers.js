/* @flow */
import isEqual from 'lodash.isequal';

import type { MuteState, Action } from '../types';
import { APP_REFRESH, REALM_INIT, ACCOUNT_SWITCH, EVENT_MUTED_TOPICS } from '../actionConstants';
import { NULL_ARRAY } from '../nullObjects';

const initialState: MuteState = NULL_ARRAY;

export default (state: MuteState = initialState, action: Action): MuteState => {
  switch (action.type) {
    case REALM_INIT:
      return isEqual(action.data.muted_topics, state) ? state : action.data.muted_topics;

    case APP_REFRESH:
    case ACCOUNT_SWITCH:
      return initialState;

    case EVENT_MUTED_TOPICS:
      return action.muted_topics;

    default:
      return state;
  }
};
