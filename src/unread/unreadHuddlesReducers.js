/* @flow */
import type {
  UnreadHuddlesState,
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
import { getRecipientsIds } from '../utils/recipient';
import { addItemsToHuddleArray, removeItemsDeeply } from './unreadHelpers';
import { NULL_ARRAY } from '../nullObjects';

const initialState: UnreadHuddlesState = NULL_ARRAY;

const realmInit = (state: UnreadHuddlesState, action: RealmInitAction): UnreadHuddlesState =>
  (action.data.unread_msgs && action.data.unread_msgs.huddles) || initialState;

const eventNewMessage = (
  state: UnreadHuddlesState,
  action: EventNewMessageAction,
): UnreadHuddlesState => {
  if (action.message.type !== 'private') {
    return state;
  }

  if (action.message.display_recipient.length < 3) {
    return state;
  }

  if (action.ownEmail && action.ownEmail === action.message.sender_email) {
    return state;
  }

  return addItemsToHuddleArray(
    state,
    [action.message.id],
    getRecipientsIds(action.message.display_recipient),
  );
};

const markMessagesRead = (
  state: UnreadHuddlesState,
  action: MarkMessagesReadAction,
): UnreadHuddlesState => removeItemsDeeply(state, action.messageIds);

const eventMessageDelete = (
  state: UnreadHuddlesState,
  action: EventMessageDeleteAction,
): UnreadHuddlesState => removeItemsDeeply(state, [action.messageId]);

const eventUpdateMessageFlags = (
  state: UnreadHuddlesState,
  action: EventUpdateMessageFlagsAction,
): UnreadHuddlesState => {
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
  state: UnreadHuddlesState = initialState,
  action: UnreadAction,
): UnreadHuddlesState => {
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
