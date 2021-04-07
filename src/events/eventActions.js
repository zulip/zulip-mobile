/* @flow strict-local */
import type { Dispatch, GetState } from '../types';
import * as api from '../api';
import { logout } from '../account/accountActions';
import { deadQueue } from '../session/sessionActions';
import eventToAction from './eventToAction';
import doEventActionSideEffects from './doEventActionSideEffects';
import { tryGetAuth } from '../selectors';
import { BackoffMachine } from '../utils/async';
import { ApiError } from '../api/apiErrors';
import * as logging from '../utils/logging';

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

    for (const event of events) {
      try {
        const state = getState();
        const action = eventToAction(state, event);
        if (!action) {
          continue;
        }

        // These side effects should not be moved to reducers, which
        // are explicitly not the place for side effects (see
        // https://redux.js.org/faq/actions).
        dispatch(doEventActionSideEffects(action));

        dispatch(action);
      } catch (e) {
        // We had an error processing the event.  Log it and carry on.
        logging.error(e);
      }
    }

    lastEventId = Math.max.apply(null, [lastEventId, ...events.map(x => x.id)]);
  }
};
