/* @flow strict-local */
import { batchActions } from 'redux-batched-actions';

import type { Auth, Action, Dispatch, GeneralEvent, GetState, GlobalState } from '../types';
import * as api from '../api';
import { logout } from '../account/accountActions';
import { deadQueue } from '../session/sessionActions';
import eventToAction from './eventToAction';
import eventMiddleware from './eventMiddleware';
import { tryGetAuth } from '../selectors';
import actionCreator from '../actionCreator';
import { BackoffMachine } from '../utils/async';
import { ApiError } from '../api/apiErrors';
import { authEquivalent } from '../account/accountMisc';

/** Convert an `/events` response into a sequence of our Redux actions. */
export const responseToActions = (
  state: GlobalState,
  events: $ReadOnlyArray<GeneralEvent>,
): Action[] =>
  events
    .map(event => {
      eventMiddleware(state, event);
      return eventToAction(state, event);
    })
    .filter(action => {
      if (action.type === 'ignore') {
        return false;
      }

      if (!action || !action.type || action.type === 'unknown') {
        console.log('Can not handle event', action.event); // eslint-disable-line
        return false;
      }

      return true;
    });

export const dispatchOrBatch = (dispatch: Dispatch, actions: $ReadOnlyArray<Action>) => {
  if (actions.length > 1) {
    dispatch(batchActions(actions));
  } else if (actions.length === 1) {
    dispatch(actions[0]);
  }
};

/**
 * Poll an event queue on the Zulip server for updates, in a loop, as long as
 * the user remains logged into the same account.
 *
 * This is part of our use of the Zulip events system; see `doInitialFetch`
 * for discussion.
 */
export const startEventPolling = (auth: Auth, queueId: number, eventId: number) => async (
  dispatch: Dispatch,
  getState: GetState,
) => {
  let lastEventId = eventId;

  const backoffMachine = new BackoffMachine();

  // eslint-disable-next-line no-constant-condition
  while (true) {
    if (!authEquivalent(auth, tryGetAuth(getState()))) {
      // The user logged out or switched accounts during progressiveTimeout
      // called from see catch block, below. (If tryGetAuth returns undefined,
      // the user is not logged in.)
      break;
    }

    try {
      const { events } = await api.pollForEvents(auth, queueId, lastEventId);

      if (!authEquivalent(auth, tryGetAuth(getState()))) {
        // The user logged out or switched accounts while api.pollForEvents was in progress.
        // (If tryGetAuth returns undefined, the user is not logged in.)
        break;
      }

      const actions = responseToActions(getState(), events);

      actionCreator(dispatch, actions, getState());
      dispatchOrBatch(dispatch, actions);

      lastEventId = Math.max.apply(null, [lastEventId, ...events.map(x => x.id)]);
    } catch (e) {
      if (e.httpStatus === 401) {
        // 401 Unauthorized -> our `auth` is invalid.  No use retrying.
        dispatch(logout());
        break;
      }

      if (e instanceof ApiError && e.code === 'BAD_EVENT_QUEUE_ID') {
        // The event queue is too old or has been garbage collected.
        dispatch(deadQueue());
        break;
      }

      // protection from inadvertent DOS
      await backoffMachine.wait();
    }
  }
};
