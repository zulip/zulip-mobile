/* @flow */
import type { Action, UnreadState } from '../types';
import {
  REALM_INIT,
  ACCOUNT_SWITCH,
  EVENT_NEW_MESSAGE,
  EVENT_UPDATE_MESSAGE_FLAGS,
  MARK_MESSAGES_READ,
} from '../actionConstants';
import { addItemsToStreamArray, removeItemsDeeply } from './unreadHelpers';

const initialState: Object[] = [];

export default (state: UnreadState = initialState, action: Action): UnreadState => {
  switch (action.type) {
    case REALM_INIT:
      return (action.data.unread_msgs && action.data.unread_msgs.streams) || [];

    case ACCOUNT_SWITCH:
      return initialState;

    case EVENT_NEW_MESSAGE:
      return action.message.type === 'stream'
        ? addItemsToStreamArray(
            state,
            [action.message.id],
            action.message.stream_id,
            action.message.subject,
          )
        : state;

    case MARK_MESSAGES_READ:
      return removeItemsDeeply(state, action.messageIds);

    case EVENT_UPDATE_MESSAGE_FLAGS: {
      if (action.flag !== 'read') {
        return state;
      }

      if (action.operation === 'add') {
        return removeItemsDeeply(state, action.messages);
      } else if (action.operation === 'remove') {
        // we do not support that operation
      }

      return state;
    }

    default:
      return state;
  }
};
