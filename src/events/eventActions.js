/* @flow strict-local */
import type { EventAction } from '../actionTypes';
import type { Dispatch, GeneralEvent, GetState, GlobalState } from '../types';
import * as api from '../api';
import { logout } from '../account/accountActions';
import { deadQueue } from '../session/sessionActions';
import eventToAction from './eventToAction';
import doEventActionSideEffects from './doEventActionSideEffects';
import { tryGetAuth } from '../selectors';
import { BackoffMachine } from '../utils/async';
import { ApiError } from '../api/apiErrors';
import * as logging from '../utils/logging';

/** Convert an `/events` response into a sequence of our Redux actions. */
export const eventsToActions = (
  state: GlobalState,
  events: $ReadOnlyArray<GeneralEvent>,
): EventAction[] =>
  events
    .map(event => eventToAction(state, event))
    .filter(action => {
      if (action.type === 'ignore') {
        return false;
      }

      if (action.type === 'unknown') {
        console.log('Cannot handle event', action.event); // eslint-disable-line
        return false;
      }

      return true;
    });

/**
 * Poll an event queue on the Zulip server for updates, in a loop.
 *
 * This is part of our use of the Zulip events system; see `doInitialFetch`
 * for discussion.
 */
export const startEventPolling = (queueId: number, eventId: number) => async (
  dispatch: Dispatch,
  getState: GetState,
) => {
  let lastEventId = eventId;

  const backoffMachine = new BackoffMachine();

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const auth = tryGetAuth(getState());
    if (!auth) {
      // User switched accounts or logged out
      break;
    }

    let events = undefined;
    try {
      const response = await api.pollForEvents(auth, queueId, lastEventId);
      events = response.events;

      // User switched accounts or logged out
      if (queueId !== getState().session.eventQueueId) {
        break;
      }
    } catch (e) {
      // We had an error polling the server for events.

      if (e.httpStatus === 401) {
        // 401 Unauthorized -> our `auth` is invalid.  No use retrying.
        dispatch(logout());
        break;
      }

      // protection from inadvertent DDOS
      await backoffMachine.wait();

      if (e instanceof ApiError && e.code === 'BAD_EVENT_QUEUE_ID') {
        // The event queue is too old or has been garbage collected.
        dispatch(deadQueue());
        break;
      }

      continue;
    }

    try {
      const actions = eventsToActions(getState(), events);

      actions.forEach(action => {
        // These side effects should not be moved to reducers, which
        // are explicitly not the place for side effects (see
        // https://redux.js.org/faq/actions).
        dispatch(doEventActionSideEffects(action));
        dispatch(action);
      });

      lastEventId = Math.max.apply(null, [lastEventId, ...events.map(x => x.id)]);
    } catch (e) {
      // We had an error processing an event.  Log it and carry on.
      logging.error(e);
    }
  }
};
