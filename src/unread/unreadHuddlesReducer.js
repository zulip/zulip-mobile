/* @flow strict-local */
import type { Action } from '../types';
import type { UnreadHuddlesState } from './unreadModelTypes';
import {
  REALM_INIT,
  LOGOUT,
  ACCOUNT_SWITCH,
  EVENT_NEW_MESSAGE,
  EVENT_MESSAGE_DELETE,
  EVENT_UPDATE_MESSAGE_FLAGS,
} from '../actionConstants';
import { pmUnreadsKeyFromMessage, recipientsOfPrivateMessage } from '../utils/recipient';
import { addItemsToHuddleArray, removeItemsDeeply } from './unreadHelpers';
import { NULL_ARRAY } from '../nullObjects';

const initialState: UnreadHuddlesState = NULL_ARRAY;

const eventNewMessage = (state, action) => {
  if (action.message.type !== 'private') {
    return state;
  }

  if (recipientsOfPrivateMessage(action.message).length < 3) {
    return state;
  }

  if (action.ownUser.email && action.ownUser.email === action.message.sender_email) {
    return state;
  }

  return addItemsToHuddleArray(state, [action.message.id], pmUnreadsKeyFromMessage(action.message));
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

export default (state: UnreadHuddlesState = initialState, action: Action): UnreadHuddlesState => {
  switch (action.type) {
    case LOGOUT:
    case ACCOUNT_SWITCH:
      return initialState;

    case REALM_INIT:
      return (action.data.unread_msgs && action.data.unread_msgs.huddles) || initialState;

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
