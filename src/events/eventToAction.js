/* @flow */
import type { GlobalState, EventAction } from '../types';
import {
  INIT_ALERT_WORDS,
  EVENT_NEW_MESSAGE,
  EVENT_PRESENCE,
  EVENT_REACTION_ADD,
  EVENT_REACTION_REMOVE,
  EVENT_STREAM_ADD,
  EVENT_STREAM_REMOVE,
  EVENT_STREAM_UPDATE,
  EVENT_STREAM_OCCUPY,
  EVENT_SUBSCRIPTION_ADD,
  EVENT_SUBSCRIPTION_REMOVE,
  EVENT_SUBSCRIPTION_UPDATE,
  EVENT_SUBSCRIPTION_PEER_ADD,
  EVENT_SUBSCRIPTION_PEER_REMOVE,
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
  EVENT_REALM_EMOJI_UPDATE,
  EVENT_UPDATE_GLOBAL_NOTIFICATIONS_SETTINGS,
  EVENT_UPDATE_DISPLAY_SETTINGS,
  EVENT_REALM_FILTERS,
} from '../actionConstants';

const opToActionSubscription = {
  add: EVENT_SUBSCRIPTION_ADD,
  remove: EVENT_SUBSCRIPTION_REMOVE,
  update: EVENT_SUBSCRIPTION_UPDATE,
  peer_add: EVENT_SUBSCRIPTION_PEER_ADD,
  peer_remove: EVENT_SUBSCRIPTION_PEER_REMOVE,
};

const opToActionStream = {
  create: EVENT_STREAM_ADD,
  delete: EVENT_STREAM_REMOVE,
  update: EVENT_STREAM_UPDATE,
  occupy: EVENT_STREAM_OCCUPY,
};

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

export default (state: GlobalState, event: Object): EventAction => {
  switch (event.type) {
    case 'alert_words':
      return {
        type: INIT_ALERT_WORDS,
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

    case 'update_message':
      return {
        ...event,
        type: EVENT_UPDATE_MESSAGE,
      };

    case 'subscription':
      return {
        ...event,
        type: opToActionSubscription[event.op],
      };

    case 'realm_user':
      return {
        ...event,
        type: opToActionUser[event.op],
      };

    case 'realm_bot':
      return { type: 'ignore' };

    case 'stream':
      return {
        ...event,
        type: opToActionStream[event.op],
      };

    case 'reaction':
      return {
        ...event,
        type: opToActionReaction[event.op],
      };

    case 'heartbeat':
      return { type: 'ignore' };

    case 'presence':
      return {
        ...event,
        type: EVENT_PRESENCE,
      };

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

    case 'muted_topics':
      return {
        ...event,
        type: EVENT_MUTED_TOPICS,
      };

    case 'realm_emoji':
      return {
        ...event,
        type: EVENT_REALM_EMOJI_UPDATE,
      };

    case 'realm_filters':
      return {
        ...event,
        type: EVENT_REALM_FILTERS,
      };

    case 'update_global_notifications':
      return {
        ...event,
        type: EVENT_UPDATE_GLOBAL_NOTIFICATIONS_SETTINGS,
      };

    case 'update_display_settings':
      return {
        ...event,
        type: EVENT_UPDATE_DISPLAY_SETTINGS,
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
