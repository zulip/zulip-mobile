/* @flow */
import type { Action, UnreadState } from '../types';
import {
  REALM_INIT,
  ACCOUNT_SWITCH,
  EVENT_NEW_MESSAGE,
  EVENT_UPDATE_MESSAGE_FLAGS,
  MARK_MESSAGES_READ,
} from '../actionConstants';
import { addItemsToPmArray, removeItemsDeeply } from './unreadHelpers';

const initialState: Object[] = [];

export default (state: UnreadState = initialState, action: Action): UnreadState => {
  switch (action.type) {
    case REALM_INIT:
      return (action.data.unread_msgs && action.data.unread_msgs.pms) || [];

    case ACCOUNT_SWITCH:
      return initialState;

    case EVENT_NEW_MESSAGE:
      return action.message.type === 'private' && action.message.display_recipient.length === 2
        ? addItemsToPmArray(state, [action.message.id], action.message.sender_id)
        : state;

    case MARK_MESSAGES_READ:
      return removeItemsDeeply(state, action.messageIds);

    case EVENT_UPDATE_MESSAGE_FLAGS: {
      if (action.flag !== 'read') {
        return state;
      }

      if (action.operation === 'add') {
        return addItemsToPmArray(state, action.messages, action.messages[0].sender_id);
      } else if (action.operation === 'remove') {
        return removeItemsDeeply(state, action.messages);
      }

      return state;
    }

    default:
      return state;
  }
};
