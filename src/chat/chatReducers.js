/* @flow */
import isEqual from 'lodash.isequal';

import type { ChatState, Action } from '../types';
import {
  APP_REFRESH,
  INITIAL_FETCH_COMPLETE,
  LOGOUT,
  LOGIN_SUCCESS,
  ACCOUNT_SWITCH,
  SWITCH_NARROW,
  MESSAGE_FETCH_COMPLETE,
  EVENT_NEW_MESSAGE,
  EVENT_REACTION_ADD,
  EVENT_REACTION_REMOVE,
  EVENT_UPDATE_MESSAGE,
  EVENT_UPDATE_MESSAGE_FLAGS,
  WEBVIEW_CLEAR_MESSAGES_FROM,
  WEBVIEW_CLEAR_ALL_UPDATE_MESSAGES,
  WEBVIEW_CLEAR_ALL_UPDATE_MESSAGE_TAGS,
} from '../actionConstants';
import { homeNarrow, isMessageInNarrow, getNarrowFromMessage, isSameNarrow } from '../utils/narrow';
import chatUpdater from './chatUpdater';
import { getMessagesById } from '../selectors';
import { NULL_ARRAY, NULL_OBJECT } from '../nullObjects';

const initialState: ChatState = {
  narrow: homeNarrow,
  messages: NULL_OBJECT,
  webView: { updateMessages: [], messages: [], updateMessageTags: [] },
};

export default (state: ChatState = initialState, action: Action) => {
  switch (action.type) {
    case APP_REFRESH:
    case LOGOUT:
    case LOGIN_SUCCESS:
    case ACCOUNT_SWITCH:
      return initialState;

    case SWITCH_NARROW: {
      const key = JSON.stringify(action.narrow);
      return {
        ...state,
        narrow: action.narrow,
        webView: {
          ...state.webView,
          messages: [
            {
              id: Date.now(),
              action: {
                numAfter: -1,
                numBefore: -1,
                messages: state.messages[key] || [],
                narrow: action.narrow,
              },
            },
          ],
        },
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

      // check if messages are in active narrow
      if (!isSameNarrow(action.narrow, state.narrow)) {
        return {
          ...state,
          messages: {
            ...state.messages,
            [key]: newMessages,
          },
        };
      }

      return {
        ...state,
        messages: {
          ...state.messages,
          [key]: newMessages,
        },
        webView: {
          ...state.webView,
          messages: [...state.webView.messages, { id: Date.now(), action }],
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
      let newState = {
        ...state,
        messages: Object.keys(state.messages).reduce((msg, key) => {
          const isInNarrow = isMessageInNarrow(action.message, JSON.parse(key), action.ownEmail);

          if (
            isInNarrow &&
            (action.caughtUp[key] && action.caughtUp[key].newer) &&
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
      const { message } = action;
      const key = JSON.stringify(getNarrowFromMessage(message, action.ownEmail));
      if (!stateChange && state.messages[key] === undefined) {
        // new message is in new narrow in which we don't have any message
        stateChange = true;
        newState = {
          ...state,
          messages: {
            ...state.messages,
            [key]: [action.message],
          },
        };
      }
      return stateChange ? newState : state;
    }

    case EVENT_UPDATE_MESSAGE:
      return chatUpdater(state, action, oldMessage => ({
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

    case EVENT_UPDATE_MESSAGE_FLAGS:
      if (action.flag !== 'starred') {
        return state;
      }

      return {
        ...state,
        webView: {
          ...state.webView,
          updateMessageTags: [
            ...state.webView.updateMessageTags,
            ...action.messages
              .map(messageId => {
                const message = state.messages[JSON.stringify(state.narrow)].find(
                  x => x.id === messageId,
                );
                if (message) {
                  return {
                    id: Date.now(),
                    action: {
                      messageId,
                      timeEdited: message.last_edit_timestamp,
                      isStarred: action.operation === 'add',
                      isOutbox: message.isOutbox,
                    },
                  };
                }
                return undefined;
              })
              .filter(messagesAction => messagesAction !== undefined),
          ],
        },
      };

    case WEBVIEW_CLEAR_MESSAGES_FROM:
      return { ...state, webView: { ...state.webView, messages: [] } };

    case WEBVIEW_CLEAR_ALL_UPDATE_MESSAGES:
      return { ...state, webView: { ...state.webView, updateMessages: [] } };

    case WEBVIEW_CLEAR_ALL_UPDATE_MESSAGE_TAGS:
      return { ...state, webView: { ...state.webView, updateMessageTags: [] } };

    case INITIAL_FETCH_COMPLETE:
      return { ...state, webView: { messages: [], updateMessages: [], updateMessageTags: [] } };

    default:
      return state;
  }
};
