/* @flow strict-local */
import type {
  UnreadPmsState,
  Action,
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
import { addItemsToPmArray, removeItemsDeeply } from './unreadHelpers';
import { NULL_ARRAY } from '../nullObjects';

const initialState: UnreadPmsState = NULL_ARRAY;

const realmInit = (state: UnreadPmsState, action: RealmInitAction): UnreadPmsState =>
  (action.data.unread_msgs && action.data.unread_msgs.pms) || initialState;

const eventNewMessage = (state: UnreadPmsState, action: EventNewMessageAction): UnreadPmsState => {
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

const markMessagesRead = (state: UnreadPmsState, action: MarkMessagesReadAction): UnreadPmsState =>
  removeItemsDeeply(state, action.messageIds);

const eventMessageDelete = (
  state: UnreadPmsState,
  action: EventMessageDeleteAction,
): UnreadPmsState => removeItemsDeeply(state, [action.messageId]);

const eventUpdateMessageFlags = (
  state: UnreadPmsState,
  action: EventUpdateMessageFlagsAction,
): UnreadPmsState => {
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
