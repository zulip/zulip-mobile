/* @flow strict-local */
import type { UnreadPmsState, Action } from '../types';
import {
  REALM_INIT,
  LOGOUT,
  ACCOUNT_SWITCH,
  EVENT_NEW_MESSAGE,
  EVENT_MESSAGE_DELETE,
  EVENT_UPDATE_MESSAGE_FLAGS,
} from '../actionConstants';
import { addItemsToPmArray, removeItemsDeeply } from './unreadHelpers';
import { NULL_ARRAY } from '../nullObjects';

const initialState: UnreadPmsState = NULL_ARRAY;

const eventNewMessage = (state, action) => {
  if (action.message.type !== 'private') {
    return state;
  }

  if (action.message.display_recipient.length !== 2) {
    return state;
  }

  if (action.ownEmail && action.ownEmail === action.message.sender_email) {
    return state;
  }

  return addItemsToPmArray(state, [action.message.id], action.message.sender_id);
};

const eventUpdateMessageFlags = (state, action) => {
  if (action.flag !== 'read') {
    return state;
  }

  if (action.all) {
    return initialState;
  }

  if (action.operation === 'add') {
    return removeItemsDeeply(state, action.messages);
  } else if (action.operation === 'remove') {
    // we do not support that operation
  }

  return state;
};

export default (state: UnreadPmsState = initialState, action: Action): UnreadPmsState => {
  switch (action.type) {
    case LOGOUT:
    case ACCOUNT_SWITCH:
      return initialState;

    case REALM_INIT:
      return (action.data.unread_msgs && action.data.unread_msgs.pms) || initialState;

    case EVENT_NEW_MESSAGE:
      return eventNewMessage(state, action);

    case EVENT_MESSAGE_DELETE:
      return removeItemsDeeply(state, action.messageIds);

    case EVENT_UPDATE_MESSAGE_FLAGS:
      return eventUpdateMessageFlags(state, action);

    default:
      return state;
  }
};
