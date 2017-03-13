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
  EVENT_UPDATE_MESSAGE,
  EVENT_UPDATE_MESSAGE_FLAGS,
  EVENT_USER_ADD,
  EVENT_USER_REMOVE,
  EVENT_USER_UPDATE,
} from '../constants';

const opToActionSubscription = {
  'add': EVENT_SUBSCRIPTION_ADD,
  'remove': EVENT_SUBSCRIPTION_REMOVE,
  'update': EVENT_SUBSCRIPTION_UPDATE,
  'peer_add': EVENT_SUBSCRIPTION_PEER_ADD,
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

export default (auth, event) => {
  console.log('HANDLE EVENT', event);

  switch (event.type) {
    case 'message':
      return {
        type: EVENT_NEW_MESSAGE,
        message: event.message,
        selfEmail: auth.email,
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
        type: opToActionSubscription[event.op],
        ...event,
      };

    case 'realm_user':
      return {
        type: opToActionUser[event.op],
        ...event,
      };

    case 'realm_bot':
      break;

    case 'stream':
      return {
        type: opToActionStream[event.op],
        ...event,
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
        type: EVENT_PRESENCE,
        presence: event.presence,
      };

    case 'update_message_flags':
      return {
        type: EVENT_UPDATE_MESSAGE_FLAGS,
        presence: event.presence,
      };

    default:
  }

  // eslint-disable-next-line no-console
  console.warn('Unrecognized event: ', event.type);
  return null;
};
