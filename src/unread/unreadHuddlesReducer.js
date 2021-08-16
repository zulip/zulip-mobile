/* @flow strict-local */
import invariant from 'invariant';

import type { Action } from '../types';
import type { UnreadHuddlesState } from './unreadModelTypes';
import {
  REGISTER_COMPLETE,
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
  const { message } = action;

  if (message.type !== 'private') {
    return state;
  }

  if (recipientsOfPrivateMessage(message).length < 3) {
    return state;
  }

  invariant(message.flags, 'message in EVENT_NEW_MESSAGE must have flags');
  if (message.flags.includes('read')) {
    return state;
  }

  return addItemsToHuddleArray(state, [message.id], pmUnreadsKeyFromMessage(message));
};

const eventUpdateMessageFlags = (state, action) => {
  if (action.flag !== 'read') {
    return state;
  }

  if (action.all) {
    return initialState;
  }

  if (action.op === 'add') {
    return removeItemsDeeply(state, action.messages);
  } else if (action.op === 'remove') {
    // we do not support that operation
  }

  return state;
};

export default (state: UnreadHuddlesState = initialState, action: Action): UnreadHuddlesState => {
  switch (action.type) {
    case LOGOUT:
    case ACCOUNT_SWITCH:
      return initialState;

    case REGISTER_COMPLETE:
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
