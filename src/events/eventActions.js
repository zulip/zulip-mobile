/* @flow strict-local */
import { addBreadcrumb } from '@sentry/react-native';
// $FlowFixMe[untyped-import]
import isEqual from 'lodash.isequal';

import type { GeneralEvent, ThunkAction } from '../types';
import * as api from '../api';
import { logout } from '../account/logoutActions';
import { deadQueue } from '../session/sessionActions';
import eventToAction from './eventToAction';
import doEventActionSideEffects from './doEventActionSideEffects';
import { tryGetAuth, getIdentity } from '../selectors';
import { identityOfAuth } from '../account/accountMisc';
import { BackoffMachine } from '../utils/async';
import { ApiError, RequestError } from '../api/apiErrors';
import * as logging from '../utils/logging';

/**
 * Handle a single Zulip event from the server.
 *
 * This is part of our use of the Zulip events system; see `registerAndStartPolling`
 * for discussion.
 */
const handleEvent = (event: GeneralEvent, dispatch, getState) => {
  addBreadcrumb({
    category: 'z-event',
    level: 'info',
    data: { type: event.type, ...(event.op !== undefined && { op: event.op }) },
  });

  try {
    const action = eventToAction(getState(), event);
    if (!action) {
      return;
    }

    // These side effects should not be moved to reducers, which
    // are explicitly not the place for side effects (see
    // https://redux.js.org/faq/actions).
    dispatch(doEventActionSideEffects(action));

    // Now dispatch the plain-object action, for our reducers to handle.
    dispatch(action);
  } catch (e) {
    // We had an error processing the event.  Log it and carry on.
    logging.error(e);
  }
};

/**
 * Poll an event queue on the Zulip server for updates, in a loop.
 *
 * This is part of our use of the Zulip events system; see `registerAndStartPolling`
 * for discussion.
 */
export const startEventPolling =
  (queueId: string, eventId: number): ThunkAction<Promise<void>> =>
  async (dispatch, getState) => {
    let lastEventId = eventId;

    const backoffMachine = new BackoffMachine();

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const auth = tryGetAuth(getState());
      if (!auth) {
        // This account is not logged in.
        break;
      }
      // `auth` represents the active account.  It might be different from
      // the one in the previous loop iteration, if we did a backoff wait.
      // TODO(#5009): Is that really quite OK?

      let events = undefined;
      try {
        const response = await api.pollForEvents(auth, queueId, lastEventId);
        events = response.events;

        if (getState().session.eventQueueId === null) {
          // We don't want to keep polling, e.g., because we've logged out;
          // see `PerAccountSessionState.eventQueueId` for other cases.
          break;
        } else if (!isEqual(getIdentity(getState()), identityOfAuth(auth))) {
          // During the last poll, the active account changed. Stop polling
          // for the previous one.
          // TODO(#5005): Remove this conditional as unreachable, once `auth`
          //   represents the current account (instead of secretly
          //   representing the global "active account" which can change.)
          break;
        } else if (queueId !== getState().session.eventQueueId) {
          // While the most recent poll was happening, another queue was
          // established for this account, and we've started polling on that
          // one. Stop polling on this one.
          //
          // In theory this could happen if you logged out of this account and
          // logged back in again.
          //
          // TODO(#5009): Instead of this conditional, abort the
          //   `api.pollForEvents` immediately when `eventQueueId` becomes
          //   `null`, then break at that time?
          break;
        }
      } catch (errorIllTyped) {
        const e: mixed = errorIllTyped; // https://github.com/facebook/flow/issues/2470
        // We had an error polling the server for events.

        if (e instanceof RequestError && e.httpStatus === 401) {
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
        handleEvent(event, dispatch, getState);
      }

      lastEventId = Math.max(lastEventId, ...events.map(x => x.id));
    }
  };
