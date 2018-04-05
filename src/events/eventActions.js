/* @flow */
import { batchActions } from 'redux-batched-actions';

import type { EventAction, Dispatch, GetState, GlobalState } from '../types';
import { pollForEvents } from '../api';
import { appRefresh } from '../actions';
import eventToAction from './eventToAction';
import eventMiddleware from './eventMiddleware';
import { getAuth } from '../selectors';
import actionCreator from '../actionCreator';

export const responseToActions = (state: GlobalState, response: Object): EventAction[] =>
  response.events
    .map(event => {
      eventMiddleware(state, event);
      return eventToAction(state, event);
    })
    .filter(action => {
      if (action.type === 'ignore') return false;

      if (!action || !action.type || action.type === 'unknown') {
        console.log('Can not handle event', action.event); // eslint-disable-line
        return false;
      }

      return true;
    });

export const dispatchOrBatch = (dispatch: Dispatch, actions: EventAction[]) => {
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
      const response = await pollForEvents(auth, queueId, lastEventId);

      // User switched accounts or logged out
      if (queueId !== getState().session.eventQueueId || auth.apiKey === '') {
        break;
      }

      const actions = responseToActions(getState(), response);

      actionCreator(dispatch, actions, getState());
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
