import { Auth } from '../types';
import { pollForEvents, registerForEvents } from '../api';
import { isMessageInNarrow } from '../utils/narrow';

import {
  REALM_INIT,
  EVENT_NEW_MESSAGE,
  EVENT_SUBSCRIPTION_ADD,
  EVENT_SUBSCRIPTION_REMOVE,
  EVENT_UPDATE_MESSAGE,
  EVENTS_REGISTERED,
  EVENT_PRESENCE,
  EVENT_UPDATE_MESSAGE_FLAGS,
} from '../constants';

const processEvent = (dispatch, event, getState) => {
  const isInNarrow = () =>
    isMessageInNarrow(
      event.message,
      getState().chat.narrow,
      getState().account[0].email,
    );

  switch (event.type) {
    case 'message':
      if (isInNarrow()) {
        dispatch({
          type: EVENT_NEW_MESSAGE,
          message: event.message,
        });
      }
      break;
    case 'update_message':
      if (isInNarrow()) {
        dispatch({
          type: EVENT_UPDATE_MESSAGE,
          messageId: event.message_id,
          newContent: event.rendered_content,
          editTimestamp: event.edit_timestamp,
        });
      }
      break;
    case 'subscription': {
      if (event.op === 'add') {
        dispatch({
          type: EVENT_SUBSCRIPTION_ADD,
          event,
        });
      } else if (event.op === 'remove') {
        dispatch({
          type: EVENT_SUBSCRIPTION_REMOVE,
          event,
        });
      }
      break;
    }
    case 'realm_user':
    case 'realm_bot':
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
      if (isInNarrow()) {
        dispatch({
          type: EVENT_UPDATE_MESSAGE_FLAGS,
          presence: event.presence,
        });
      }
      break;
    default:
      console.warn('Unrecognized event: ', event.type);  // eslint-disable-line no-console
  }
};

export const fetchEvents = (auth: Auth) =>
  async (dispatch, getState) => {
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
      const response = await pollForEvents(auth, queueId, lastEventId);

      for (const event of response.events) {
        lastEventId = Math.max(lastEventId, event.id);
        processEvent(dispatch, event, getState);
      }
    }
  };
