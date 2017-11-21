/* @flow */
import { batchActions } from 'redux-batched-actions';

import type { Dispatch, GetState } from '../types';
import { pollForEvents } from '../api';
import { appRefresh } from '../actions';
import eventToAction from './eventToAction';
import eventMiddleware from './eventMiddleware';
import { getAuth } from '../selectors';

export const startEventPolling = (queueId: number, eventId: number) => async (
  dispatch: Dispatch,
  getState: GetState,
) => {
  let lastEventId = eventId;

  // Event loop
  // eslint-disable-next-line no-constant-condition
  while (true) {
    let response;
    try {
      // eslint-disable-next-line no-await-in-loop
      response = await pollForEvents(getAuth(getState()), queueId, lastEventId);
    } catch (e) {
      // Stop polling - user likely switched accounts or logged out
      if (queueId !== getState().app.eventQueueId || getAuth(getState()).apiKey === '') {
        break;
      }

      // Force a refresh of the app if the event queue is too old
      // or has been garbage collected
      if (e.message.indexOf('too old') !== -1 || e.message.indexOf('Bad event queue id') !== -1) {
        // Force a refresh (index 0 is the currently active account)
        dispatch(appRefresh());
        break;
      }

      continue; // eslint-disable-line no-continue
    }
    // Stop polling - user likely switched accounts or logged out
    if (queueId !== getState().app.eventQueueId) {
      break;
    }

    const actions = [];
    for (const event of response.events) {
      lastEventId = Math.max(lastEventId, event.id);
      eventMiddleware(getState(), event);
      const action = eventToAction(getState(), event);

      if (action !== 'ignore') {
        if (action && action.type) {
          actions.push({ ...action, eventId: event.id });
        } else {
          console.log('Can not handle event or operation', event); // eslint-disable-line
        }
      }
    }

    if (actions.length > 1) {
      // Batch actions together to speed up rendering
      // (especially when resuming from a suspended state)
      dispatch(batchActions(actions));
    } else if (actions.length === 1) {
      dispatch(actions[0]);
    }
  }
};
