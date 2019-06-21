/* @flow strict-local */
import type { UnreadMentionsState, Action } from '../types';
import {
  REALM_INIT,
  ACCOUNT_SWITCH,
  EVENT_NEW_MESSAGE,
  EVENT_MESSAGE_DELETE,
  EVENT_UPDATE_MESSAGE_FLAGS,
} from '../actionConstants';
import { addItemsToArray, removeItemsFromArray } from '../utils/immutability';
import { NULL_ARRAY } from '../nullObjects';

const initialState: UnreadMentionsState = NULL_ARRAY;

const eventUpdateMessageFlags = (state, action) => {
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
};

export default (state: UnreadMentionsState = initialState, action: Action): UnreadMentionsState => {
  switch (action.type) {
    case ACCOUNT_SWITCH:
      return initialState;

    case REALM_INIT:
      return (action.data.unread_msgs && action.data.unread_msgs.mentions) || initialState;

    case EVENT_NEW_MESSAGE:
      return action.message.flags
        && action.message.flags.includes('mentioned')
        && !state.includes(action.message.id)
        ? addItemsToArray(state, [action.message.id])
        : state;

    case EVENT_MESSAGE_DELETE:
      return removeItemsFromArray(state, [action.messageId]);

    case EVENT_UPDATE_MESSAGE_FLAGS:
      return eventUpdateMessageFlags(state, action);

    default:
      return state;
  }
};
