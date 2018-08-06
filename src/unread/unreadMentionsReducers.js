/* @flow */
import type {
  UnreadMentionsState,
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
  MARK_MESSAGES_READ,
  EVENT_UPDATE_MESSAGE_FLAGS,
} from '../actionConstants';
import { addItemsToArray, removeItemsFromArray } from '../utils/immutability';
import { NULL_ARRAY } from '../nullObjects';

const initialState: UnreadMentionsState = NULL_ARRAY;

const realmInit = (state: UnreadMentionsState, action: RealmInitAction): UnreadMentionsState =>
  (action.data.unread_msgs && action.data.unread_msgs.mentions) || initialState;

const eventNewMessage = (
  state: UnreadMentionsState,
  action: EventNewMessageAction,
): UnreadMentionsState =>
  action.message.flags
  && action.message.flags.includes('mentioned')
  && !state.includes(action.message.id)
    ? addItemsToArray(state, [action.message.id])
    : state;

const markMessagesRead = (
  state: UnreadMentionsState,
  action: MarkMessagesReadAction,
): UnreadMentionsState => removeItemsFromArray(state, action.messageIds);

const eventMessageDelete = (
  state: UnreadMentionsState,
  action: EventMessageDeleteAction,
): UnreadMentionsState => removeItemsFromArray(state, [action.messageId]);

const eventUpdateMessageFlags = (
  state: UnreadMentionsState,
  action: EventUpdateMessageFlagsAction,
): UnreadMentionsState => {
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

export default (
  state: UnreadMentionsState = initialState,
  action: UnreadAction,
): UnreadMentionsState => {
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
