/* @flow strict-local */
import type { OutboxState, Action, Outbox } from '../types';
import {
  REALM_INIT,
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

const messageSendStart = (state, action) => {
  const message = state.find(item => item.timestamp === action.outbox.timestamp);
  if (message) {
    return state;
  }
  return [...state, { ...action.outbox }];
};

export default (state: OutboxState = initialState, action: Action): OutboxState => {
  switch (action.type) {
    case REALM_INIT:
      return filterArray(state, (outbox: Outbox) => !outbox.isSent);

    case MESSAGE_SEND_START:
      return messageSendStart(state, action);

    case MESSAGE_SEND_COMPLETE:
      return state.map(<O: Outbox>(item: O) =>
        item.id !== action.local_message_id ? item : { ...(item: O), isSent: true },
      );

    case DELETE_OUTBOX_MESSAGE:
    case EVENT_NEW_MESSAGE:
      return filterArray(state, item => item && item.timestamp !== +action.local_message_id);

    case ACCOUNT_SWITCH:
    case LOGOUT:
      return initialState;

    default:
      return state;
  }
};
