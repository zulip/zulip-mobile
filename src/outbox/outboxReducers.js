/* @flow strict-local */
import type {
  OutboxState,
  MessageSendStartAction,
  MessageSendCompleteAction,
  OutboxAction,
  Outbox,
  InitialFetchStartAction,
} from '../types';
import {
  INITIAL_FETCH_COMPLETE,
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

const initialFetchComplete = (state: OutboxState, action: InitialFetchStartAction): OutboxState =>
  filterArray(state, (outbox: Outbox) => !outbox.isSent);

const messageSendStart = (state: OutboxState, action: MessageSendStartAction): OutboxState => {
  const message = state.find(item => item.timestamp === action.outbox.timestamp);
  if (message) {
    return state;
  }
  return [...state, { ...action.outbox }];
};

const messageSendComplete = (state: OutboxState, action: MessageSendCompleteAction): OutboxState =>
  state.map(item => (item.id !== action.local_message_id ? item : { ...item, isSent: true }));

const deleteOutboxMessage = (
  state: OutboxState,
  action: { local_message_id: number },
): OutboxState => filterArray(state, item => item && item.timestamp !== +action.local_message_id);

export default (state: OutboxState = initialState, action: OutboxAction): OutboxState => {
  switch (action.type) {
    case INITIAL_FETCH_COMPLETE:
      return initialFetchComplete(state, action);

    case MESSAGE_SEND_START:
      return messageSendStart(state, action);

    case MESSAGE_SEND_COMPLETE:
      return messageSendComplete(state, action);

    case DELETE_OUTBOX_MESSAGE:
    case EVENT_NEW_MESSAGE:
      return deleteOutboxMessage(state, action);

    case ACCOUNT_SWITCH:
    case LOGOUT:
      return initialState;

    default:
      return state;
  }
};
