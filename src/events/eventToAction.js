/* @flow strict-local */
import { EventTypes } from '../api/eventTypes';

import type { GlobalState, EventAction } from '../types';
import {
  EVENT_ALERT_WORDS,
  EVENT_NEW_MESSAGE,
  EVENT_PRESENCE,
  EVENT_REACTION_ADD,
  EVENT_REACTION_REMOVE,
  EVENT_TYPING_START,
  EVENT_TYPING_STOP,
  EVENT_MESSAGE_DELETE,
  EVENT_UPDATE_MESSAGE,
  EVENT_UPDATE_MESSAGE_FLAGS,
  EVENT_USER_ADD,
  EVENT_USER_REMOVE,
  EVENT_USER_UPDATE,
  EVENT_MUTED_TOPICS,
  EVENT_USER_GROUP_ADD,
  EVENT_USER_GROUP_REMOVE,
  EVENT_USER_GROUP_UPDATE,
  EVENT_USER_GROUP_ADD_MEMBERS,
  EVENT_USER_GROUP_REMOVE_MEMBERS,
  EVENT_USER_STATUS_UPDATE,
  EVENT_REALM_EMOJI_UPDATE,
  EVENT_UPDATE_GLOBAL_NOTIFICATIONS_SETTINGS,
  EVENT_UPDATE_DISPLAY_SETTINGS,
  EVENT_REALM_FILTERS,
  EVENT_SUBSCRIPTION,
  EVENT,
} from '../actionConstants';

const opToActionUser = {
  add: EVENT_USER_ADD,
  remove: EVENT_USER_REMOVE,
  update: EVENT_USER_UPDATE,
};

const opToActionUserGroup = {
  add: EVENT_USER_GROUP_ADD,
  remove: EVENT_USER_GROUP_REMOVE,
  update: EVENT_USER_GROUP_UPDATE,
  add_members: EVENT_USER_GROUP_ADD_MEMBERS,
  remove_members: EVENT_USER_GROUP_REMOVE_MEMBERS,
};

const opToActionReaction = {
  add: EVENT_REACTION_ADD,
  remove: EVENT_REACTION_REMOVE,
};

const opToActionTyping = {
  start: EVENT_TYPING_START,
  stop: EVENT_TYPING_STOP,
};

const actionTypeOfEventType = {
  update_message: EVENT_UPDATE_MESSAGE,
  subscription: EVENT_SUBSCRIPTION,
  presence: EVENT_PRESENCE,
  muted_topics: EVENT_MUTED_TOPICS,
  realm_emoji: EVENT_REALM_EMOJI_UPDATE,
  realm_filters: EVENT_REALM_FILTERS,
  update_global_notifications: EVENT_UPDATE_GLOBAL_NOTIFICATIONS_SETTINGS,
  update_display_settings: EVENT_UPDATE_DISPLAY_SETTINGS,
  user_status: EVENT_USER_STATUS_UPDATE,
};

// This FlowFixMe is because this function encodes a large number of
// assumptions about the events the server sends, and doesn't check them.
export default (state: GlobalState, event: $FlowFixMe): EventAction => {
  switch (event.type) {
    case 'alert_words':
      return {
        type: EVENT_ALERT_WORDS,
        alertWords: event.alert_words,
      };

    case 'message':
      return {
        ...event,
        type: EVENT_NEW_MESSAGE,
        caughtUp: state.caughtUp,
        ownEmail: state.accounts[0].email,
      };

    case 'delete_message':
      return {
        type: EVENT_MESSAGE_DELETE,
        messageId: event.message_id,
      };

    case EventTypes.stream:
      return {
        type: EVENT,
        event,
      };

    case 'update_message':
    case 'subscription':
    case 'presence':
    case 'muted_topics':
    case 'realm_emoji':
    case 'realm_filters':
    case 'update_global_notifications':
    case 'update_display_settings':
    case 'user_status':
      return {
        ...event,
        type: actionTypeOfEventType[event.type],
      };

    case 'realm_user':
      return {
        ...event,
        type: opToActionUser[event.op],
      };

    case 'realm_bot':
      return { type: 'ignore' };

    case 'reaction':
      return {
        ...event,
        type: opToActionReaction[event.op],
      };

    case 'heartbeat':
      return { type: 'ignore' };

    case 'update_message_flags':
      return {
        ...event,
        type: EVENT_UPDATE_MESSAGE_FLAGS,
        allMessages: state.messages,
      };

    case 'typing':
      return {
        ...event,
        ownEmail: state.accounts[0].email,
        type: opToActionTyping[event.op],
        time: new Date().getTime(),
      };

    case 'user_group':
      return {
        ...event,
        type: opToActionUserGroup[event.op],
      };

    default:
      return { type: 'unknown', event };
  }
};
