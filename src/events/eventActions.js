import ApiClient from '../api/ApiClient';

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
    default:
      console.warn('Unrecognized event: ', event.type);
  }
};

export const getEvents = (account) =>
  async (dispatch) => {
    const data = await ApiClient.registerForEvents(account);

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
      const res = await ApiClient.pollForEvents(
        account,
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
