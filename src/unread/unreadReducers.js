/* @flow */
import type { Action, UnreadState } from '../types';
import { REALM_INIT, ACCOUNT_SWITCH } from '../actionConstants';

const initialState: UnreadState = {
  streams: [],
  huddles: [],
  pms: [],
  mentioned: [],
};

export default (state: UnreadState = initialState, action: Action): UnreadState => {
  switch (action.type) {
    case REALM_INIT:
      return action.data.unread_msgs;

    case ACCOUNT_SWITCH:
      return initialState;

    default:
      return state;
  }
};
