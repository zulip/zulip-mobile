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
  EventUpdateMessageContentAndTopicAction,
  EventUpdateMessageContentAction,
  EventUpdateMessageTopicAction,
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
  EVENT_UPDATE_MESSAGE_CONTENT_TOPIC,
  EVENT_UPDATE_MESSAGE_CONTENT,
  EVENT_UPDATE_MESSAGE_TOPIC,
} from '../actionConstants';
import { isMessageInNarrow } from '../utils/narrow';
import { groupItemsById } from '../utils/misc';
import chatUpdater from './chatUpdater';
import { NULL_ARRAY, NULL_OBJECT } from '../nullObjects';

const initialState: MessagesState = NULL_OBJECT;

const getMessageFromState = (state: MessagesState, messageId: number): ?Message => {
  const narrowString = Object.keys(state).find(narrow =>
    state[narrow].find(msg => msg.id === messageId),
  );
  return narrowString ? state[narrowString].find(msg => msg.id === messageId) : undefined;
};

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
  const { message } = action;
  const newState = Object.keys(state).reduce((msg, key) => {
    const isInNarrow = isMessageInNarrow(action.message, JSON.parse(key), action.ownEmail);
    const messagesLength = state[key].length;
    const isCaughtUpNewer =
      action.caughtUp[key]
      && (action.caughtUp[key].newer
        && (messagesLength === 0 || message.id > state[key][messagesLength - 1].id));
    const isCaughtUpOlder =
      action.caughtUp[key]
      && (action.caughtUp[key].older && (messagesLength === 0 || message.id < state[key][0].id));
    const isMessageIsInBetween =
      messagesLength > 0
      && message.id > state[key][0].id
      && message.id < state[key][messagesLength - 1].id;
    const messageDoesNotExist =
      state[key].find(item => action.message.id === item.id) === undefined;

    if (
      isInNarrow
      && (isCaughtUpNewer || isCaughtUpOlder || isMessageIsInBetween || messagesLength === 0)
      && messageDoesNotExist
    ) {
      stateChange = true;
      msg[key] = isCaughtUpOlder
        ? [action.message, ...state[key]]
        : [...state[key], action.message];
      // if this message is from edited
      if (isMessageIsInBetween) {
        // sort messages by id
        msg[key].sort((msg1: Message, msg2: Message) => msg1.id > msg2.id);
      }
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

const getMessageContentTopicChangeHistory = (
  action: EventUpdateMessageContentAndTopicAction,
  oldMessage: Message,
) => ({
  prev_rendered_content: action.orig_rendered_content,
  prev_subject: oldMessage.subject,
  timestamp: action.edit_timestamp,
  prev_rendered_content_version: action.prev_rendered_content_version,
  user_id: action.user_id,
});

const getMessageContentChangeHistory = (
  action: EventUpdateMessageContentAction,
  oldMessage: Message,
) => ({
  prev_rendered_content: action.orig_rendered_content,
  timestamp: action.edit_timestamp,
  prev_rendered_content_version: action.prev_rendered_content_version,
  user_id: action.user_id,
});

const getMessageTopicChangeHistory = (
  action: EventUpdateMessageTopicAction,
  oldMessage: Message,
) => ({
  prev_subject: oldMessage.subject,
  timestamp: action.edit_timestamp,
  user_id: action.user_id,
});

const createNewMessage = (
  action: EventUpdateMessageAction,
  oldMessage: Message,
  history: Object,
  changes: Object,
) => ({
  ...oldMessage,
  ...changes,
  edit_history: [history, ...(oldMessage.edit_history || NULL_ARRAY)],
  last_edit_timestamp: action.edit_timestamp,
});

const eventUpdateMessage = (
  state: MessagesState,
  newMessage: Message,
  action: EventUpdateMessageAction,
): MessagesState => {
  if (action.type !== EVENT_UPDATE_MESSAGE_CONTENT) {
    // message subject is edited
    // remove message from existing bucket
    // Call a eventNewMessage to store message in another bucket
    const { caughtUp, ownEmail } = action;
    return eventNewMessage(chatUpdater(state, action.message_id, oldMsg => undefined), {
      caughtUp,
      ownEmail,
      message: newMessage,
    });
  }
  return chatUpdater(state, action.message_id, oldMsg => newMessage);
};

const eventUpdateMessageContentTopic = (
  state: MessagesState,
  action: EventUpdateMessageContentAndTopicAction,
): MessagesState => {
  // find old message
  const oldMessage = getMessageFromState(state, action.message_id);
  if (!oldMessage) {
    return state;
  }
  const newMessage = createNewMessage(
    action,
    oldMessage,
    getMessageContentTopicChangeHistory(action, oldMessage),
    {
      content: action.rendered_content || oldMessage.content,
      subject: action.subject || oldMessage.subject,
      subject_links: action.subject_links || oldMessage.subject_links,
    },
  );
  return eventUpdateMessage(state, newMessage, action);
};

const eventUpdateMessageContent = (
  state: MessagesState,
  action: EventUpdateMessageContentAction,
): MessagesState => {
  // find old message
  const oldMessage = getMessageFromState(state, action.message_id);
  if (!oldMessage) {
    return state;
  }
  const newMessage = createNewMessage(
    action,
    oldMessage,
    getMessageContentChangeHistory(action, oldMessage),
    {
      content: action.rendered_content || oldMessage.content,
    },
  );
  return eventUpdateMessage(state, newMessage, action);
};

const eventUpdateMessageTopic = (
  state: MessagesState,
  action: EventUpdateMessageTopicAction,
): MessagesState => {
  // find old message
  const oldMessage = getMessageFromState(state, action.message_id);
  if (!oldMessage) {
    return state;
  }
  const newMessage = createNewMessage(
    action,
    oldMessage,
    getMessageTopicChangeHistory(action, oldMessage),
    {
      subject: action.subject || oldMessage.subject,
      subject_links: action.subject_links || oldMessage.subject_links,
    },
  );
  return eventUpdateMessage(state, newMessage, action);
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

    case EVENT_UPDATE_MESSAGE_CONTENT_TOPIC:
      return eventUpdateMessageContentTopic(state, action);
    case EVENT_UPDATE_MESSAGE_CONTENT:
      return eventUpdateMessageContent(state, action);
    case EVENT_UPDATE_MESSAGE_TOPIC:
      return eventUpdateMessageTopic(state, action);

    default:
      return state;
  }
};
