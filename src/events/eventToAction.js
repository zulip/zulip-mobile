import {
  EVENT_NEW_MESSAGE,
  EVENT_PRESENCE,
  EVENT_REACTION_ADD,
  EVENT_REACTION_REMOVE,
  EVENT_STREAM_ADD,
  EVENT_STREAM_REMOVE,
  EVENT_SUBSCRIPTION_ADD,
  EVENT_SUBSCRIPTION_REMOVE,
  EVENT_UPDATE_MESSAGE,
  EVENT_UPDATE_MESSAGE_FLAGS,
  EVENT_USER_ADD,
  EVENT_USER_REMOVE,
} from '../constants';

export const operationToEvent = (operation: string, events: string[]): string => {
  const operations = ['add', 'remove', 'update'];
  const operationIdx = operations.indexOf(operation);
  return events[operationIdx];
};

export default (auth, event) => {
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
        type: operationToEvent(event.op, [EVENT_SUBSCRIPTION_ADD, EVENT_SUBSCRIPTION_REMOVE]),
        subscriptions: event.subscriptions,
      };

    case 'realm_user':
      return {
        type: operationToEvent(event.op, [EVENT_USER_ADD, EVENT_USER_REMOVE]),
        users: event.users,
      };

    case 'realm_bot':
      break;

    case 'stream':
      return {
        type: operationToEvent(event.op, [EVENT_STREAM_ADD, EVENT_STREAM_REMOVE]),
        streams: event.streams,
      };
    case 'pointer':
      // TODO
      console.log(event); // eslint-disable-line
      break;

    case 'reaction':
      return {
        type: operationToEvent(event.op, [EVENT_REACTION_ADD, EVENT_REACTION_REMOVE]),
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
