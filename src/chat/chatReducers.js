/* @flow */
import isEqual from 'lodash.isequal';

import type { ChatState, Action } from '../types';
import {
  APP_REFRESH,
  LOGOUT,
  LOGIN_SUCCESS,
  ACCOUNT_SWITCH,
  SWITCH_NARROW,
  MESSAGE_FETCH_COMPLETE,
  EVENT_NEW_MESSAGE,
  EVENT_REACTION_ADD,
  EVENT_REACTION_REMOVE,
  EVENT_UPDATE_MESSAGE,
} from '../actionConstants';
import { homeNarrow, isMessageInNarrow } from '../utils/narrow';
import chatUpdater from './chatUpdater';
import { getMessagesById } from '../selectors';
import { NULL_ARRAY } from '../nullObjects';

const initialState: ChatState = {
  narrow: homeNarrow,
  messages: {},
};

export default (state: ChatState = initialState, action: Action) => {
  switch (action.type) {
    case APP_REFRESH:
    case LOGOUT:
    case LOGIN_SUCCESS:
    case ACCOUNT_SWITCH:
      return initialState;

    case SWITCH_NARROW: {
      return {
        ...state,
        narrow: action.narrow,
      };
    }

    case MESSAGE_FETCH_COMPLETE: {
      if (action.messages.length === 0) {
        return state;
      }

      const key = JSON.stringify(action.narrow);
      const messages = state.messages[key] || NULL_ARRAY;
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
      let stateChange = false;
      const newState = {
        ...state,
        messages: Object.keys(state.messages).reduce((msg, key) => {
          const isInNarrow = isMessageInNarrow(action.message, JSON.parse(key), action.ownEmail);
          if (
            isInNarrow &&
            state.messages[key].find(item => action.message.id === item.id) === undefined
          ) {
            stateChange = true;
            msg[key] = [...state.messages[key], action.message];
          } else {
            msg[key] = state.messages[key];
          }
          return msg;
        }, {}),
      };
      return stateChange ? newState : state;
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
          ...(oldMessage.edit_history || NULL_ARRAY),
        ],
        last_edit_timestamp: action.edit_timestamp,
      }));

    default:
      return state;
  }
};
