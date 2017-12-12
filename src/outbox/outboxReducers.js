/* @flow */
import type { OutboxState, Action } from '../types';
import {
  MESSAGE_SEND_START,
  EVENT_NEW_MESSAGE,
  LOGOUT,
  ACCOUNT_SWITCH,
  DELETE_OUTBOX_MESSAGE,
  MESSAGE_SEND_COMPLETE,
} from '../actionConstants';
import { NULL_ARRAY } from '../nullObjects';
import { filterArray } from '../utils/immutability';

const initialState = NULL_ARRAY;

export default (state: OutboxState = initialState, action: Action): OutboxState => {
  switch (action.type) {
    case MESSAGE_SEND_START: {
      const message = state.find(item => item.timestamp === action.params.timestamp);
      if (message) return state;
      return [...state, { ...action.params }];
    }

    case MESSAGE_SEND_COMPLETE:
    case DELETE_OUTBOX_MESSAGE:
    case EVENT_NEW_MESSAGE:
      return filterArray(state, item => item && item.timestamp !== +action.localMessageId);

    case ACCOUNT_SWITCH:
    case LOGOUT:
      return initialState;

    default:
      return state;
  }
};
