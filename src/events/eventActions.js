import { pollForEvents, registerForEvents } from '../api/ApiClient';

import {
  REALM_SET_STREAMS,
} from '../realm/realmActions';

export const EVENT_NEW_MESSAGE = 'EVENT_NEW_MESSAGE';
export const EVENTS_REGISTERED = 'EVENTS_REGISTERED';

const processEvent = (dispatch, event) => {
  switch (event.type) {
    case 'message':
      dispatch({
        type: EVENT_NEW_MESSAGE,
        message: event.message,
      });
      break;
    case 'heartbeat':
      // TODO
      break;
    case 'presence':
      // TODO
      break;
    case 'update_message_flags':
      // TODO
      break;
    default:
      console.warn('Unrecognized event: ', event.type);
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
    // TODO: fix this
    while (true) {
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
