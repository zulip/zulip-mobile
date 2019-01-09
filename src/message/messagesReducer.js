/* @flow strict-local */
import omit from 'lodash.omit';

import type { MessagesState, Action } from '../types';
import {
  DEAD_QUEUE,
  LOGOUT,
  LOGIN_SUCCESS,
  ACCOUNT_SWITCH,
  MESSAGE_FETCH_COMPLETE,
  EVENT_NEW_MESSAGE,
  EVENT_SUBMESSAGE,
  EVENT_MESSAGE_DELETE,
  EVENT_REACTION_ADD,
  EVENT_REACTION_REMOVE,
  EVENT_UPDATE_MESSAGE,
} from '../actionConstants';
import { NULL_ARRAY, NULL_OBJECT } from '../nullObjects';
import { groupItemsById } from '../utils/misc';

const initialState: MessagesState = NULL_OBJECT;

const eventReactionAdd = (state, action) => {
  const oldMessage = state[action.message_id];
  if (!oldMessage) {
    return state;
  }
  return {
    ...state,
    [action.message_id]: {
      ...oldMessage,
      reactions: oldMessage.reactions.concat({
        emoji_name: action.emoji_name,
        user_id: action.user_id,
        reaction_type: action.reaction_type,
        emoji_code: action.emoji_code,
      }),
    },
  };
};

const eventReactionRemove = (state, action) => {
  const oldMessage = state[action.message_id];
  if (!oldMessage) {
    return state;
  }
  return {
    ...state,
    [action.message_id]: {
      ...oldMessage,
      reactions: oldMessage.reactions.filter(
        x => !(x.emoji_name === action.emoji_name && x.user_id === action.user_id),
      ),
    },
  };
};

const eventNewMessage = (state, action) => {
  // TODO: Optimize -- Only update if the new message belongs to at least
  // one narrow that is caught up.
  if (state[action.message.id]) {
    return state;
  }
  return {
    ...state,
    [action.message.id]: omit(action.message, 'flags'),
  };
};

const eventSubmessage = (state, action) => {
  const message = state[action.message_id];
  if (!message) {
    return state;
  }
  return {
    ...state,
    [action.message_id]: {
      ...message,
      submessages: [
        ...(message.submessages || []),
        {
          id: action.submessage_id,
          message_id: action.message_id,
          sender_id: action.sender_id,
          msg_type: action.msg_type,
          content: action.content,
        },
      ],
    },
  };
};

const eventMessageDelete = (state, action) => {
  if (!state[action.messageId]) {
    return state;
  }
  return omit(state, action.messageId);
};

const eventUpdateMessage = (state, action) => {
  const oldMessage = state[action.message_id];
  if (!oldMessage) {
    return state;
  }
  return {
    ...state,
    [action.message_id]: {
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
    },
  };
};

export default (state: MessagesState = initialState, action: Action): MessagesState => {
  switch (action.type) {
    case DEAD_QUEUE:
    case LOGOUT:
    case LOGIN_SUCCESS:
    case ACCOUNT_SWITCH:
      return initialState;

    case MESSAGE_FETCH_COMPLETE:
      return {
        ...state,
        ...groupItemsById(action.messages.map(message => omit(message, 'flags'))),
      };

    case EVENT_REACTION_ADD:
      return eventReactionAdd(state, action);

    case EVENT_REACTION_REMOVE:
      return eventReactionRemove(state, action);

    case EVENT_NEW_MESSAGE:
      return eventNewMessage(state, action);

    case EVENT_SUBMESSAGE:
      return eventSubmessage(state, action);

    case EVENT_MESSAGE_DELETE:
      return eventMessageDelete(state, action);

    case EVENT_UPDATE_MESSAGE:
      return eventUpdateMessage(state, action);

    default:
      return state;
  }
};
