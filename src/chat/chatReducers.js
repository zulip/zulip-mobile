/* @flow */
import isEqual from 'lodash.isequal';

import type {
  Message,
  MessagesState,
  MessageAction,
  MessageFetchCompleteAction,
  EventReactionAddAction,
  EventReactionRemoveAction,
  EventNewMessageAction,
  EventMessageDeleteAction,
  EventUpdateMessageAction,
  EventUpdateMessageFlagsAction,
} from '../types';
import {
  APP_REFRESH,
  LOGOUT,
  LOGIN_SUCCESS,
  ACCOUNT_SWITCH,
  MESSAGE_FETCH_COMPLETE,
  EVENT_NEW_MESSAGE,
  EVENT_MESSAGE_DELETE,
  EVENT_REACTION_ADD,
  EVENT_REACTION_REMOVE,
  EVENT_UPDATE_MESSAGE,
  EVENT_UPDATE_MESSAGE_FLAGS,
} from '../actionConstants';
import { isMessageInNarrow, STARRED_NARROW_STR } from '../utils/narrow';
import { groupItemsById } from '../utils/misc';
import chatUpdater from './chatUpdater';
import { NULL_ARRAY, NULL_OBJECT } from '../nullObjects';

const initialState: MessagesState = NULL_OBJECT;

const messageFetchComplete = (
  state: MessagesState,
  action: MessageFetchCompleteAction,
): MessagesState => {
  const key = JSON.stringify(action.narrow);
  const messages = state[key] || NULL_ARRAY;
  const messagesById = groupItemsById(messages);
  const replaceExisting = action.anchor === 0 || action.anchor === Number.MAX_SAFE_INTEGER;
  const newMessages = replaceExisting
    ? action.messages.map(
        item =>
          messagesById[item.id]
            ? isEqual(messagesById[item.id], item)
              ? messagesById[item.id]
              : item
            : item,
      )
    : action.messages
        .filter(x => !messagesById[x.id])
        .concat(messages)
        .sort((a, b) => a.id - b.id);

  return {
    ...state,
    [key]: newMessages,
  };
};

const eventReactionAdd = (state: MessagesState, action: EventReactionAddAction): MessagesState =>
  chatUpdater(state, action.messageId, oldMessage => ({
    ...oldMessage,
    reactions: oldMessage.reactions.concat({
      emoji_name: action.emoji,
      user: action.user,
    }),
  }));

const eventReactionRemove = (
  state: MessagesState,
  action: EventReactionRemoveAction,
): MessagesState =>
  chatUpdater(state, action.messageId, oldMessage => ({
    ...oldMessage,
    reactions: oldMessage.reactions.filter(
      x => !(x.emoji_name === action.emoji && x.user.email === action.user.email),
    ),
  }));

const eventNewMessage = (state: MessagesState, action: EventNewMessageAction): MessagesState => {
  let stateChange = false;
  const newState = Object.keys(state).reduce((msg, key) => {
    const isInNarrow = isMessageInNarrow(action.message, JSON.parse(key), action.ownEmail);
    const isCaughtUp = action.caughtUp[key] && action.caughtUp[key].newer;
    const messageDoesNotExist =
      state[key].find(item => action.message.id === item.id) === undefined;

    if (isInNarrow && isCaughtUp && messageDoesNotExist) {
      stateChange = true;
      msg[key] = [...state[key], action.message];
    } else {
      msg[key] = state[key];
    }

    return msg;
  }, {});

  return stateChange ? newState : state;
};

const eventMessageDelete = (
  state: MessagesState,
  action: EventMessageDeleteAction,
): MessagesState => {
  let stateChange = false;

  const newState = Object.keys(state).reduce((updatedState, key) => {
    updatedState[key] = state[key].filter(msg => msg.id !== action.messageId);
    stateChange = stateChange || updatedState[key].length < state[key].length;
    return updatedState;
  }, {});

  return stateChange ? newState : state;
};

const eventUpdateMessage = (
  state: MessagesState,
  action: EventUpdateMessageAction,
): MessagesState =>
  chatUpdater(state, action.message_id, oldMessage => ({
    ...oldMessage,
    content: action.rendered_content || oldMessage.content,
    subject: action.subject || oldMessage.subject,
    subject_links: action.subject_links || oldMessage.subject_links,
    edit_history: [
      action.orig_rendered_content
        ? action.orig_subject
          ? {
              prev_rendered_content: action.orig_rendered_content,
              prev_subject: oldMessage.subject,
              timestamp: action.edit_timestamp,
              prev_rendered_content_version: action.prev_rendered_content_version,
              user_id: action.user_id,
            }
          : {
              prev_rendered_content: action.orig_rendered_content,
              timestamp: action.edit_timestamp,
              prev_rendered_content_version: action.prev_rendered_content_version,
              user_id: action.user_id,
            }
        : {
            prev_subject: oldMessage.subject,
            timestamp: action.edit_timestamp,
            user_id: action.user_id,
          },
      ...(oldMessage.edit_history || NULL_ARRAY),
    ],
    last_edit_timestamp: action.edit_timestamp,
  }));

const eventUpdateMessageFlags = (
  state: MessagesState,
  action: EventUpdateMessageFlagsAction,
): MessagesState => {
  /*
    In order to add new messages to the 'is:starred' narrow, we cache newly
    starred messages.

    This local variable will no longer be necessary when the messages state is
    refactored into a map of message_id -> message, as narrows will then be
    represented as lists of ids, and referencing action.messages will suffice.
  */
  const messageCache: { [id: number]: Message } = {};

  // Update the flags fields
  const result = Object.keys(state).reduce((updatedState, narrow) => {
    updatedState[narrow] = state[narrow].map(message => {
      if (!action.messages.includes(message.id)) {
        return message;
      }

      const updatedMessage = Object.assign({}, message);
      if (action.messages.includes(message.id)) {
        if (action.operation === 'add') {
          updatedMessage.flags = [...message.flags, action.flag];
          if (action.flag === 'starred') {
            // local side effect: cache newly starred messages
            messageCache[message.id] = updatedMessage;
          }
        } else {
          // action.operation === 'remove'
          updatedMessage.flags = message.flags.filter(flag => flag !== action.flag);
        }
      }

      return updatedMessage;
    });

    return updatedState;
  }, {});

  // Update the 'is:starred' narrow
  if (action.flag === 'starred') {
    if (action.operation === 'add') {
      result[STARRED_NARROW_STR] = [
        ...result[STARRED_NARROW_STR],
        ...Object.values(messageCache),
      ].sort((a, b) => a.timestamp - b.timestamp);
    } else {
      // action.operation === 'remove'
      result[STARRED_NARROW_STR] = result[STARRED_NARROW_STR].filter(
        message => !action.messages.includes(message.id),
      );
    }
  }

  return result;
};

export default (state: MessagesState = initialState, action: MessageAction): MessagesState => {
  switch (action.type) {
    case APP_REFRESH:
    case LOGOUT:
    case LOGIN_SUCCESS:
    case ACCOUNT_SWITCH:
      return initialState;

    case MESSAGE_FETCH_COMPLETE:
      return messageFetchComplete(state, action);

    case EVENT_REACTION_ADD:
      return eventReactionAdd(state, action);

    case EVENT_REACTION_REMOVE:
      return eventReactionRemove(state, action);

    case EVENT_NEW_MESSAGE:
      return eventNewMessage(state, action);

    case EVENT_MESSAGE_DELETE:
      return eventMessageDelete(state, action);

    case EVENT_UPDATE_MESSAGE:
      return eventUpdateMessage(state, action);

    case EVENT_UPDATE_MESSAGE_FLAGS:
      return eventUpdateMessageFlags(state, action);

    default:
      return state;
  }
};
