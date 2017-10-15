/* @flow */
import type { Action, UnreadState } from '../types';
import {
  REALM_INIT,
  ACCOUNT_SWITCH,
  EVENT_NEW_MESSAGE,
  MARK_MESSAGES_READ,
  MARK_MESSAGE_AS_READ_LOCALLY,
} from '../actionConstants';
import { addItemsToArray, removeItemsFromArray } from '../utils/immutability';
import { NULL_ARRAY } from '../nullObjects';

const initialState: number[] = NULL_ARRAY;

export default (state: UnreadState = initialState, action: Action): UnreadState => {
  switch (action.type) {
    case REALM_INIT:
      return (action.data.unread_msgs && action.data.unread_msgs.mentions) || NULL_ARRAY;

    case ACCOUNT_SWITCH:
      return initialState;

    case EVENT_NEW_MESSAGE:
      return action.message.is_mentioned && !state.includes(action.message.id)
        ? addItemsToArray(state, [action.message.id])
        : state;

    case MARK_MESSAGES_READ:
      return removeItemsFromArray(state, action.messageIds);

    case MARK_MESSAGE_AS_READ_LOCALLY: {
      if (action.flag !== 'read') {
        return state;
      }

      if (action.operation === 'add') {
        return removeItemsFromArray(state, action.messages);
      } else if (action.operation === 'remove') {
        // we do not support that operation
      }

      return state;
    }

    default:
      return state;
  }
};
