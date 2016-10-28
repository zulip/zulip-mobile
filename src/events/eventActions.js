import { pollForEvents, registerForEvents } from '../api';

import {
  REALM_SET_STREAMS,
  EVENT_NEW_MESSAGE,
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
    case 'realm_user':
      // TODO
      break;
    case 'subscription':
      // TODO
      break;
    case 'update_message':
      // TODO
      break;
    case 'pointer':
      // TODO
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

export const getEvents = (auth) =>
  async (dispatch) => {
    const data = await registerForEvents(auth);

    const queueId = data.queue_id;
    let lastEventId = data.last_event_id;

    dispatch({
      type: REALM_SET_STREAMS,
      subscriptions: data.subscriptions,
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
