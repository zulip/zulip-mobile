/* @flow */
import { batchActions } from 'redux-batched-actions';

import type { Action, Dispatch, GetState, GlobalState } from '../types';
import { pollForEvents } from '../api';
import { appRefresh } from '../actions';
import eventToAction from './eventToAction';
import eventMiddleware from './eventMiddleware';
import { getAuth } from '../selectors';

const responseToActions = (state: GlobalState, response) => {
  const actions = [];
  for (const event of response.events) {
    eventMiddleware(state, event);
    const action = eventToAction(state, event);

    if (action === 'ignore') continue;

    if (!action || action === 'unknown') {
      console.log('Can not handle event', event); // eslint-disable-line
      continue;
    }

    if (!action.type) {
      console.log('Can not handle event', event); // eslint-disable-line
      continue;
    }

    actions.push({ ...action, eventId: event.id });
  }
  return actions;
};

const dispatchOrBatch = (dispatch: Dispatch, actions: Action[]) => {
  if (actions.length > 1) {
    dispatch(batchActions(actions));
  } else if (actions.length === 1) {
    dispatch(actions[0]);
  }
};

export const startEventPolling = (queueId: number, eventId: number) => async (
  dispatch: Dispatch,
  getState: GetState,
) => {
  let lastEventId = eventId;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const auth = getAuth(getState());
    try {
      // eslint-disable-next-line no-await-in-loop
      const response = await pollForEvents(auth, queueId, lastEventId);

      // User switched accounts or logged out
      if (queueId !== getState().app.eventQueueId || auth.apiKey === '') {
        break;
      }

      const actions = responseToActions(getState(), response);

      dispatchOrBatch(dispatch, actions);

      lastEventId = Math.max.apply(null, [lastEventId, ...response.events.map(x => x.id)]);
    } catch (e) {
      // The event queue is too old or has been garbage collected
      if (e.message.indexOf('too old') !== -1 || e.message.indexOf('Bad event queue id') !== -1) {
        dispatch(appRefresh());
        break;
      }
    }
  }
};
