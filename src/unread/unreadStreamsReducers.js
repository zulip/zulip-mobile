/* @flow strict-local */
import type {
  UnreadStreamsState,
  UnreadAction,
  RealmInitAction,
  EventNewMessageAction,
  MarkMessagesReadAction,
  EventMessageDeleteAction,
  EventUpdateMessageFlagsAction,
} from '../types';
import {
  REALM_INIT,
  ACCOUNT_SWITCH,
  EVENT_NEW_MESSAGE,
  EVENT_MESSAGE_DELETE,
  EVENT_UPDATE_MESSAGE_FLAGS,
  MARK_MESSAGES_READ,
} from '../actionConstants';
import { addItemsToStreamArray, removeItemsDeeply } from './unreadHelpers';
import { NULL_ARRAY } from '../nullObjects';

const initialState: UnreadStreamsState = NULL_ARRAY;

const realmInit = (state: UnreadStreamsState, action: RealmInitAction): UnreadStreamsState =>
  (action.data.unread_msgs && action.data.unread_msgs.streams) || initialState;

const eventNewMessage = (
  state: UnreadStreamsState,
  action: EventNewMessageAction,
): UnreadStreamsState => {
  if (action.message.type !== 'stream') {
    return state;
  }

  if (action.ownEmail && action.ownEmail === action.message.sender_email) {
    return state;
  }

  return addItemsToStreamArray(
    state,
    [action.message.id],
    action.message.stream_id,
    action.message.subject,
  );
};

const markMessagesRead = (
  state: UnreadStreamsState,
  action: MarkMessagesReadAction,
): UnreadStreamsState => removeItemsDeeply(state, action.messageIds);

const eventMessageDelete = (
  state: UnreadStreamsState,
  action: EventMessageDeleteAction,
): UnreadStreamsState => removeItemsDeeply(state, [action.messageId]);

const eventUpdateMessageFlags = (
  state: UnreadStreamsState,
  action: EventUpdateMessageFlagsAction,
): UnreadStreamsState => {
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

export default (
  state: UnreadStreamsState = initialState,
  action: UnreadAction,
): UnreadStreamsState => {
  switch (action.type) {
    case ACCOUNT_SWITCH:
      return initialState;

    case REALM_INIT:
      return realmInit(state, action);

    case EVENT_NEW_MESSAGE:
      return eventNewMessage(state, action);

    case MARK_MESSAGES_READ:
      return markMessagesRead(state, action);

    case EVENT_MESSAGE_DELETE:
      return eventMessageDelete(state, action);

    case EVENT_UPDATE_MESSAGE_FLAGS:
      return eventUpdateMessageFlags(state, action);

    default:
      return state;
  }
};
