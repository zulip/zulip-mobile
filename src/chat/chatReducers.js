/* @flow */
import isEqual from 'lodash.isequal';

import type { ChatState, Action } from '../types';
import {
  LOGOUT,
  LOGIN_SUCCESS,
  ACCOUNT_SWITCH,
  SWITCH_NARROW,
  MESSAGE_FETCH_START,
  MESSAGE_FETCH_SUCCESS,
  EVENT_NEW_MESSAGE,
  EVENT_REACTION_ADD,
  EVENT_REACTION_REMOVE,
  EVENT_UPDATE_MESSAGE,
} from '../actionConstants';
import { homeNarrow, isMessageInNarrow } from '../utils/narrow';
import chatUpdater from './chatUpdater';
import { getMessagesById } from '../selectors';

const initialState: ChatState = {
  fetchingOlder: true,
  fetchingNewer: true,
  narrow: homeNarrow(),
  messages: {},
};

export default (state: ChatState = initialState, action: Action) => {
  switch (action.type) {
    case LOGOUT:
    case LOGIN_SUCCESS:
    case ACCOUNT_SWITCH:
      return initialState;
    case MESSAGE_FETCH_START:
      return {
        ...state,
        narrow: action.narrow,
        fetchingOlder: action.fetchingOlder,
        fetchingNewer: action.fetchingNewer,
      };

    case SWITCH_NARROW: {
      return {
        ...state,
        narrow: action.narrow,
        fetchingOlder: false,
        fetchingNewer: false,
      };
    }

    case MESSAGE_FETCH_SUCCESS: {
      const key = JSON.stringify(action.narrow);
      const messages = state.messages[key] || [];

      const messagesById = getMessagesById(state);
      const newMessages = action.replaceExisting
        ? action.messages.map(
            item =>
              messagesById[item.id]
                ? isEqual(messagesById[item.id], item) ? messagesById[item.id] : item
                : item,
          )
        : action.messages
            .filter(x => !messagesById[x.id])
            .concat(messages)
            .sort((a, b) => a.timestamp - b.timestamp);

      return {
        ...state,
        fetchingOlder: false,
        fetchingNewer: false,
        messages: {
          ...state.messages,
          [key]: newMessages,
        },
      };
    }

    case EVENT_REACTION_ADD:
      return chatUpdater(state, action.messageId, oldMessage => ({
        ...oldMessage,
        reactions: oldMessage.reactions.concat({
          emoji_name: action.emoji,
          user: action.user,
        }),
      }));

    case EVENT_REACTION_REMOVE:
      return chatUpdater(state, action.messageId, oldMessage => ({
        ...oldMessage,
        reactions: oldMessage.reactions.filter(
          x => !(x.emoji_name === action.emoji && x.user.email === action.user.email),
        ),
      }));

    case EVENT_NEW_MESSAGE: {
      return {
        ...state,
        messages: Object.keys(state.messages).reduce((msg, key) => {
          const isInNarrow = isMessageInNarrow(action.message, JSON.parse(key), action.ownEmail);
          msg[key] = isInNarrow ? [...state.messages[key], action.message] : state.messages[key];

          return msg;
        }, {}),
      };
    }

    case EVENT_UPDATE_MESSAGE:
      return chatUpdater(state, action.message_id, oldMessage => ({
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
          ...(oldMessage.edit_history || []),
        ],
        last_edit_timestamp: action.edit_timestamp,
      }));
    default:
      return state;
  }
};
