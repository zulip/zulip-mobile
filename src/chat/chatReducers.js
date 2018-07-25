/* @flow */
import isEqual from 'lodash.isequal';

import type {
  NarrowsState,
  MessageAction,
  MessageFetchCompleteAction,
  EventReactionAddAction,
  EventReactionRemoveAction,
  EventNewMessageAction,
  EventMessageDeleteAction,
  EventUpdateMessageAction,
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
} from '../actionConstants';
import { LAST_MESSAGE_ANCHOR, FIRST_UNREAD_ANCHOR } from '../constants';
import { isMessageInNarrow } from '../utils/narrow';
import { groupItemsById } from '../utils/misc';
import chatUpdater from './chatUpdater';
import { NULL_ARRAY, NULL_OBJECT } from '../nullObjects';

const initialState: NarrowsState = NULL_OBJECT;

const messageFetchComplete = (
  state: NarrowsState,
  action: MessageFetchCompleteAction,
): NarrowsState => {
  const key = JSON.stringify(action.narrow);
  const messages = state[key] || NULL_ARRAY;
  const messagesById = groupItemsById(messages);
  const replaceExisting =
    action.anchor === FIRST_UNREAD_ANCHOR || action.anchor === LAST_MESSAGE_ANCHOR;
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

const eventReactionAdd = (state: NarrowsState, action: EventReactionAddAction): NarrowsState =>
  chatUpdater(state, action.message_id, oldMessage => ({
    ...oldMessage,
    reactions: oldMessage.reactions.concat({
      emoji_name: action.emoji_name,
      user: action.user,
    }),
  }));

const eventReactionRemove = (
  state: NarrowsState,
  action: EventReactionRemoveAction,
): NarrowsState =>
  chatUpdater(state, action.message_id, oldMessage => ({
    ...oldMessage,
    reactions: oldMessage.reactions.filter(
      x => !(x.emoji_name === action.emoji_name && x.user.email === action.user.email),
    ),
  }));

const eventNewMessage = (state: NarrowsState, action: EventNewMessageAction): NarrowsState => {
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
  state: NarrowsState,
  action: EventMessageDeleteAction,
): NarrowsState => {
  let stateChange = false;

  const newState = Object.keys(state).reduce((updatedState, key) => {
    updatedState[key] = state[key].filter(msg => msg.id !== action.messageId);
    stateChange = stateChange || updatedState[key].length < state[key].length;
    return updatedState;
  }, {});

  return stateChange ? newState : state;
};

const eventUpdateMessage = (state: NarrowsState, action: EventUpdateMessageAction): NarrowsState =>
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

export default (state: NarrowsState = initialState, action: MessageAction): NarrowsState => {
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

    default:
      return state;
  }
};
