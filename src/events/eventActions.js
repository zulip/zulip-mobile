import { Auth } from '../types';
import { pollForEvents, registerForEvents } from '../api';
import { switchAccount } from '../account/accountActions';
import timeout from '../utils/timeout';

import {
  BATCH_ACTIONS,
  REALM_INIT,
  EVENT_NEW_MESSAGE,
  EVENT_REGISTERED,
  EVENT_SUBSCRIPTION_ADD,
  EVENT_SUBSCRIPTION_REMOVE,
  EVENT_REACTION_ADD,
  EVENT_REACTION_REMOVE,
  EVENT_UPDATE_MESSAGE,
  EVENT_PRESENCE,
  EVENT_UPDATE_MESSAGE_FLAGS,
  EVENT_UNKNOWN,
} from '../constants';

const processEvent = (auth, event) => {
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
    case 'subscription': {
      if (event.op === 'add') {
        return {
          type: EVENT_SUBSCRIPTION_ADD,
          subscriptions: event.subscriptions,
        };
      } else if (event.op === 'remove') {
        return {
          type: EVENT_SUBSCRIPTION_REMOVE,
          subscriptions: event.subscriptions,
        };
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
    case 'reaction':
      return {
        type: event.op === 'add' ? EVENT_REACTION_ADD : EVENT_REACTION_REMOVE,
        emoji: event.emoji_name,
        messageId: event.message_id,
        user: event.user,
      };
    case 'heartbeat':
      // ignore, no need to handle
      break;
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
      // eslint-disable-next-line no-console
      console.warn('Unrecognized event: ', event.type);
  }
  return { type: EVENT_UNKNOWN };
};

const startEventLoop = (auth, queueId, eventId) =>
  async (dispatch, getState) => {
    let lastEventId = eventId;
    let numFailures = 0;

    // Event loop
    // eslint-disable-next-line no-constant-condition
    while (true) {
      let response;
      try {
        // eslint-disable-next-line no-await-in-loop
        response = await pollForEvents(auth, queueId, lastEventId);
      } catch (err) {
        // Stop polling - user likely switched accounts or logged out
        if (queueId !== getState().events.queueId) {
          break;
        }

        // Use exponential back-off when retrying
        const retrySec = Math.min(90, Math.exp(numFailures / 2));
        // eslint-disable-next-line no-await-in-loop
        await timeout(retrySec * 1000);
        numFailures++;
        continue; // eslint-disable-line no-continue
      }

      // Stop polling - user likely switched accounts or logged out
      if (queueId !== getState().events.queueId) {
        break;
      }

      if (!response.result !== 'success') {
        if (response.msg.indexOf('too old') !== -1 ||
            response.msg.indexOf('Bad event queue id') !== -1) {
          // Force a refresh (index 0 is the currently active account)
          dispatch(switchAccount(0));
          break;
        }
      } else {
        numFailures = 0;

        const actions = [];
        for (const event of response.events) {
          lastEventId = Math.max(lastEventId, event.id);
          actions.push({ ...processEvent(auth, event), eventId: event.id });
        }

        if (actions.length > 1) {
          // Batch actions together to speed up rendering
          // (especially when resuming from a suspended state)
          dispatch({ type: BATCH_ACTIONS, actions });
        } else if (actions.length > 0) {
          dispatch(actions[0]);
        }
      }
    }
  };

export const fetchEvents = (auth: Auth) =>
  async (dispatch, getState) => {
    const data = await registerForEvents(auth);

    const queueId = data.queue_id;
    const lastEventId = data.last_event_id;

    dispatch({
      type: REALM_INIT,
      data,
    });

    dispatch({
      type: EVENT_REGISTERED,
      queueId,
      lastEventId,
    });

    // Start the event loop
    dispatch(startEventLoop(auth, queueId, lastEventId));
  };
