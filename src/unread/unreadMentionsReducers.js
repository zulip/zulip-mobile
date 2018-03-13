/* @flow */
import type { Action, UnreadMentionsState } from '../types';
import {
  REALM_INIT,
  ACCOUNT_SWITCH,
  EVENT_NEW_MESSAGE,
  EVENT_MESSAGE_DELETE,
  MARK_MESSAGES_READ,
  EVENT_UPDATE_MESSAGE_FLAGS,
} from '../actionConstants';
import { addItemsToArray, removeItemsFromArray } from '../utils/immutability';
import { NULL_ARRAY } from '../nullObjects';

const initialState: UnreadMentionsState = NULL_ARRAY;

export default (state: UnreadMentionsState = initialState, action: Action): UnreadMentionsState => {
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

    case EVENT_MESSAGE_DELETE:
      return removeItemsFromArray(state, [action.messageId]);

    case EVENT_UPDATE_MESSAGE_FLAGS: {
      if (action.flag !== 'read') {
        return state;
      }

      if (action.all) {
        return initialState;
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
