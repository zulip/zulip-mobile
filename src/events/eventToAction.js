/* @flow */
import { StateType } from '../types';
import {
  EVENT_NEW_MESSAGE,
  EVENT_PRESENCE,
  EVENT_REACTION_ADD,
  EVENT_REACTION_REMOVE,
  EVENT_STREAM_ADD,
  EVENT_STREAM_REMOVE,
  EVENT_STREAM_UPDATE,
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
  EVENT_MUTED_TOPICS
} from '../actionConstants';

import { getUserById } from '../users/usersSelectors';

const opToActionSubscription = {
  'add': EVENT_SUBSCRIPTION_ADD,
  'remove': EVENT_SUBSCRIPTION_REMOVE,
  'update': EVENT_SUBSCRIPTION_UPDATE,
  'peer_add': EVENT_SUBSCRIPTION_PEER_ADD,
  'peer_remove': EVENT_SUBSCRIPTION_PEER_REMOVE,
};

const opToActionStream = {
  'add': EVENT_STREAM_ADD,
  'remove': EVENT_STREAM_REMOVE,
  'update': EVENT_STREAM_UPDATE,
};

const opToActionUser = {
  'add': EVENT_USER_ADD,
  'remove': EVENT_USER_REMOVE,
  'update': EVENT_USER_UPDATE,
};

const opToActionReaction = {
  'add': EVENT_REACTION_ADD,
  'remove': EVENT_REACTION_REMOVE,
};

const opToActionTyping = {
  'start': EVENT_TYPING_START,
  'stop': EVENT_TYPING_STOP,
};

export default (state: StateType, event: Object) => {
  switch (event.type) {
    case 'message':
      return {
        type: EVENT_NEW_MESSAGE,
        message: event.message,
        selfEmail: state.accounts[0].email,
      };

    case 'update_message':
      return {
        type: EVENT_UPDATE_MESSAGE,
        messageId: event.message_id,
        newContent: event.rendered_content,
        editTimestamp: event.edit_timestamp,
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
      // ignore, no need to handle
      return null;

    case 'presence':
      return {
        ...event,
        type: EVENT_PRESENCE,
      };

    case 'update_message_flags':
      return {
        ...event,
        type: EVENT_UPDATE_MESSAGE_FLAGS,
      };

    case 'typing':
      return {
        ...event,
        selfEmail: state.accounts[0].email,
        type: opToActionTyping[event.op],
      };
    case 'muted_topics':
      return {
        type: EVENT_MUTED_TOPICS,
        ...event
      };
    default:
  }

  // eslint-disable-next-line no-console
  console.warn('Unrecognized event: ', event.type);
  return null;
};
