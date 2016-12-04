import { pollForEvents, registerForEvents } from '../api';

import {
  REALM_INIT,
  EVENT_NEW_MESSAGE,
  EVENT_UPDATE_MESSAGE,
  EVENTS_REGISTERED,
  EVENT_PRESENCE,
  EVENT_UPDATE_MESSAGE_FLAGS,
} from '../constants';

export type HeartbeatEvent = {
  type: 'heartbeat',
  id: number,
};

export type MessageEvent = {
  type: 'message',
  id: number,
};

export type PresenceEvent = {
  type: 'message',
  id: number,
  email: string,
  presence: any,
  server_timestamp: number,
};

export type UpdateMessageFlagsEvent = {
  type: 'update_message_flags',
  id: number,
  all: boolean,
  flag: 'read' | '???',
  messages: number[],
  operation: 'add' | '???',
};

const processEvent = (dispatch, event) => {
  switch (event.type) {
    case 'message':
      dispatch({
        type: EVENT_NEW_MESSAGE,
        message: event.message,
      });
      break;
    case 'update_message':
      dispatch({
        type: EVENT_UPDATE_MESSAGE,
        messageId: event.message_id,
        newContent: event.rendered_content,
        editTimestamp: event.edit_timestamp,
      });
      break;
    case 'realm_user':
    case 'ream_bot':
    case 'subscription':
    case 'stream':
    case 'pointer':
      // TODO
      console.log(event); // eslint-disable-line
      break;
    case 'heartbeat':
      // ignore, no need to handle
      break;
    case 'presence':
      dispatch({
        type: EVENT_PRESENCE,
        presence: event.presence,
      });
      break;
    case 'update_message_flags':
      dispatch({
        type: EVENT_UPDATE_MESSAGE_FLAGS,
        presence: event.presence,
      });
      break;
    default:
      console.warn('Unrecognized event: ', event.type);  // eslint-disable-line no-console
  }
};

export const fetchEvents = (auth) =>
  async (dispatch) => {
    const data = await registerForEvents(auth);
    const queueId = data.queue_id;
    let lastEventId = data.last_event_id;

    dispatch({
      type: REALM_INIT,
      data,
    });

    dispatch({
      type: EVENTS_REGISTERED,
      queueId,
    });

    // Event loop
    while (true) { // eslint-disable-line no-constant-condition
      const res = await pollForEvents(
        auth,
        queueId,
        lastEventId,
      );

      // Process events
      for (const event of res.events) {
        lastEventId = Math.max(lastEventId, event.id);
        processEvent(dispatch, event);
      }
    }
  };
