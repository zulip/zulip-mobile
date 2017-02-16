import { Auth } from '../types';
import { pollForEvents, registerForEvents } from '../api';
import { getActiveAccount } from '../account/accountSelectors';

import {
  BATCH_ACTIONS,
  REALM_INIT,
  EVENT_NEW_MESSAGE,
  EVENT_QUEUE_REGISTERED,
  EVENT_QUEUE_SUSPENDED,
  EVENT_QUEUE_RESTARTED,
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
    // Event loop
    while (true) { // eslint-disable-line no-constant-condition
      let response;
      try {
        // eslint-disable-next-line no-await-in-loop
        response = await pollForEvents(auth, queueId, lastEventId);
      } catch (err) {
        // TODO: handle this
        // we probably want to force a refresh
        break;
      }

      // Stop polling - user likely switched accounts or logged out
      if (queueId !== getState().events.queueId) {
        break;
      }

      // Stop polling - app is going into a suspended state
      if (!getState().app.isActive) {
        dispatch({ type: EVENT_QUEUE_SUSPENDED });
        break;
      }

      const actions = response.events.map((event) => ({
        ...processEvent(auth, event),
        eventId: event.id,
      }));
      lastEventId = Math.max(
        lastEventId,
        ...response.events.map((event) => event.id)
      );

      if (actions.length > 1) {
        // Batch actions together to speed up rendering
        // (especially when resuming from a suspended state)
        dispatch({ type: BATCH_ACTIONS, actions });
      } else if (actions.length > 0) {
        dispatch(actions[0]);
      }
    }
  };

export const restartEventLoop = () =>
  async (dispatch, getState) => {
    const state = getState();
    dispatch({ type: EVENT_QUEUE_RESTARTED });
    dispatch(
      startEventLoop(
        getActiveAccount(state),
        state.events.queueId,
        state.events.lastEventId,
      )
    );
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
      type: EVENT_QUEUE_REGISTERED,
      queueId,
      lastEventId,
    });

    // Start the event loop
    dispatch(startEventLoop(auth, queueId, lastEventId));
  };
