/* @flow */
import type { Auth, Dispatch, GetState } from '../types';
import { pollForEvents, registerForEvents } from '../api';
import { switchAccount } from '../account/accountActions';
import { timeout } from '../utils/async';
import eventToAction from './eventToAction';
import eventMiddleware from './eventMiddleware';

import {
  BATCH_ACTIONS,
  REALM_INIT,
  EVENT_REGISTERED,
} from '../actionConstants';

const startEventPolling = (auth: Auth, queueId: number, eventId: number) =>
  async (dispatch: Dispatch, getState: GetState) => {
    let lastEventId = eventId;
    let numFailures = 0;

    // Event loop
    // eslint-disable-next-line no-constant-condition
    while (true) {
      let response;
      try {
        // eslint-disable-next-line no-await-in-loop
        response = await pollForEvents(auth, queueId, lastEventId);
      } catch (e) {
        // Stop polling - user likely switched accounts or logged out
        if (queueId !== getState().app.eventQueueId) {
          break;
        }

        // Force a refresh of the app if the event queue is too old
        // or has been garbage collected
        if (e.message.indexOf('too old') !== -1 ||
            e.message.indexOf('Bad event queue id') !== -1) {
          // Force a refresh (index 0 is the currently active account)
          dispatch(switchAccount(0));
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
      if (queueId !== getState().app.eventQueueId) {
        break;
      }

      numFailures = 0;

      const actions = [];
      for (const event of response.events) {
        lastEventId = Math.max(lastEventId, event.id);
        eventMiddleware(getState(), event);
        const action = eventToAction(getState(), event);

        if (action) {
          actions.push({ ...action, eventId: event.id });
        }
      }

      if (actions.length > 1) {
        // Batch actions together to speed up rendering
        // (especially when resuming from a suspended state)
        dispatch({ type: BATCH_ACTIONS, actions });
      } else if (actions.length === 1) {
        dispatch(actions[0]);
      }
    }
  };

export const fetchEvents = (auth: Auth) =>
  async (dispatch: Dispatch, getState: GetState) => {
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
    dispatch(startEventPolling(auth, queueId, lastEventId));
  };
