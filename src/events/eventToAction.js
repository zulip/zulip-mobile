/* @flow */
import { logWarningToSentry } from '../utils/logging';
import type { GlobalState } from '../types';
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
  EVENT_UPDATE_MESSAGE,
  EVENT_UPDATE_MESSAGE_FLAGS,
  EVENT_USER_ADD,
  EVENT_USER_REMOVE,
  EVENT_USER_UPDATE,
  EVENT_MUTED_TOPICS,
  EVENT_REALM_EMOJI_UPDATE,
  EVENT_UPDATE_GLOBAL_NOTIFICATIONS_SETTINGS,
  EVENT_UPDATE_DISPLAY_SETTINGS,
  EVENT_REALM_FILTER_UPDATE,
} from '../actionConstants';

import { getUserById } from '../users/userHelpers';

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

const opToActionReaction = {
  add: EVENT_REACTION_ADD,
  remove: EVENT_REACTION_REMOVE,
};

const opToActionTyping = {
  start: EVENT_TYPING_START,
  stop: EVENT_TYPING_STOP,
};

export default (state: GlobalState, event: Object) => {
  switch (event.type) {
    case 'alert_words':
      return {
        type: INIT_ALERT_WORDS,
        alertWords: event.alert_words,
      };
    case 'message':
      return {
        type: EVENT_NEW_MESSAGE,
        message: event.message,
        caughtUp: state.caughtUp,
        ownEmail: state.accounts[0].email,
        localMessageId: event.local_message_id,
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
        user: getUserById(state.users, event.user_id),
      };

    case 'realm_user':
      return {
        ...event,
        type: opToActionUser[event.op],
      };

    case 'realm_bot':
      break;

    case 'stream':
      return {
        ...event,
        type: opToActionStream[event.op],
      };
    case 'pointer':
      // TODO
      console.log(event); // eslint-disable-line
      break;

    case 'reaction':
      return {
        type: opToActionReaction[event.op],
        emoji: event.emoji_name,
        messageId: event.message_id,
        user: event.user,
      };

    case 'heartbeat':
      return 'ignore';

    case 'presence':
      return {
        ...event,
        type: EVENT_PRESENCE,
      };

    case 'update_message_flags':
      return {
        ...event,
        type: EVENT_UPDATE_MESSAGE_FLAGS,
        allMessages: state.chat.messages,
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
        type: EVENT_REALM_FILTER_UPDATE,
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

    default:
      return 'unknown';
  }
  logWarningToSentry(`Unrecognized event: ${event.type}`);
  // eslint-disable-next-line no-console
  console.warn('Unrecognized event: ', event.type);
  return null;
};
