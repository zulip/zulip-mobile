/* @flow strict-local */
import invariant from 'invariant';

import type { PerAccountApplicableAction } from '../types';
import type { UnreadPmsState } from './unreadModelTypes';
import {
  REGISTER_COMPLETE,
  LOGOUT,
  ACCOUNT_SWITCH,
  EVENT_NEW_MESSAGE,
  EVENT_MESSAGE_DELETE,
  EVENT_UPDATE_MESSAGE_FLAGS,
} from '../actionConstants';
import { addItemsToPmArray, removeItemsDeeply } from './unreadHelpers';
import { NULL_ARRAY } from '../nullObjects';
import { recipientsOfPrivateMessage } from '../utils/recipient';

const initialState: UnreadPmsState = NULL_ARRAY;

const eventNewMessage = (state, action) => {
  if (action.message.type !== 'private') {
    return state;
  }

  if (recipientsOfPrivateMessage(action.message).length > 2) {
    return state;
  }

  invariant(action.message.flags, 'message in EVENT_NEW_MESSAGE must have flags');
  if (action.message.flags.includes('read')) {
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

  if (action.op === 'add') {
    return removeItemsDeeply(state, action.messages);
  } else if (action.op === 'remove') {
    // we do not support that operation
  }

  return state;
};

export default (
  state: UnreadPmsState = initialState, // eslint-disable-line default-param-last
  action: PerAccountApplicableAction,
): UnreadPmsState => {
  switch (action.type) {
    case LOGOUT:
    case ACCOUNT_SWITCH:
      return initialState;

    case REGISTER_COMPLETE:
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
