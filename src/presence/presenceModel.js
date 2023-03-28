/* @flow strict-local */
import Immutable from 'immutable';
import differenceInSeconds from 'date-fns/differenceInSeconds';
import differenceInDays from 'date-fns/differenceInDays';
import formatDistanceToNow from 'date-fns/formatDistanceToNow';

import type {
  ClientPresence,
  UserPresence,
  PresenceStatus,
  UserStatus,
  PresenceState,
  PerAccountApplicableAction,
} from '../types';
import { ensureUnreachable } from '../types';
import { objectEntries } from '../flowPonyfill';
import type { PerAccountState } from '../reduxTypes';
import type { UserId } from '../api/idTypes';
import { tryGetUserForId } from '../users/userSelectors';
import { getUserStatus } from '../user-statuses/userStatusesModel';
import { getZulipFeatureLevel } from '../account/accountsSelectors';
import {
  EVENT_PRESENCE,
  PRESENCE_RESPONSE,
  REGISTER_COMPLETE,
  RESET_ACCOUNT_DATA,
} from '../actionConstants';

//
//
// Simple selectors and getters.
//

export const getPresence = (state: PerAccountState): PresenceState => state.presence;

export function getUserPresenceByEmail(state: PresenceState, email: string): UserPresence | void {
  return state.byEmail.get(email);
}

//
//
// More-complex selectors, getters, and friends.
//

/** The relation `>=`, where `active` > `idle` > `offline`. */
const presenceStatusGeq = (a: PresenceStatus, b: PresenceStatus): boolean => {
  /* prettier-ignore */
  switch (a) {
    case 'active':  return true;
    case 'idle':    return b !== 'active';
    case 'offline': return b !== 'active' && b !== 'idle';
    default:
      ensureUnreachable(a); return false;
  }
};

const OFFLINE_THRESHOLD_SECS = 140;

/**
 * Aggregate our information on a user's presence across their clients.
 *
 * For an explanation of the Zulip presence model this helps implement, see
 * the subsystem doc:
 *   https://zulip.readthedocs.io/en/latest/subsystems/presence.html
 *
 * This logic should match `status_from_timestamp` in the web app's
 * `static/js/presence.js` at 1ae07b93d^.
 */
export const getAggregatedPresence = (presence: UserPresence): ClientPresence => {
  /* Gives an artificial ClientPresence object where
   * - `timestamp` is the latest `timestamp` of all ClientPresence
   *   objects in the input, and
   * - `status` is the greatest `status` of all *recent* ClientPresence
   *   objects, where `active` > `idle` > `offline`. If there are no
   *   recent ClientPresence objects (i.e., they are all at least as
   *   old as OFFLINE_THRESHOLD_SECS), `status` is 'offline'. If there
   *   are several ClientPresence objects with the greatest
   *   PresenceStatus, an arbitrary one is chosen.
   * - `client` is the `client` of the ClientPresence object from the
   *   calculation of `status` (see previous), or empty string if
   *   there wasn't one.
   *
   * It may not be entirely correct, but the `timestamp`'s
   * ClientPresence object may be a different one than what `status`
   * and `client` were drawn from.
   */

  let status = 'offline';
  let client = '';
  let timestamp = 0;

  const dateNow = Date.now();

  for (const [device, devicePresence] of objectEntries(presence)) {
    if (device === 'aggregated') {
      continue;
    }

    const age = dateNow / 1000 - devicePresence.timestamp;
    if (timestamp < devicePresence.timestamp) {
      timestamp = devicePresence.timestamp;
    }
    if (age < OFFLINE_THRESHOLD_SECS) {
      if (presenceStatusGeq(devicePresence.status, status)) {
        client = device;
        status = devicePresence.status;
      }
    }
  }

  return { client, status, timestamp };
};

export const presenceToHumanTime = (
  presence: UserPresence,
  status: UserStatus,
  zulipFeatureLevel: number,
): string => {
  if (!presence || !presence.aggregated) {
    return 'never';
  }

  const lastTimeActive = new Date(presence.aggregated.timestamp * 1000);

  // "Invisible mode", new in FL 148, doesn't involve UserStatus['away']:
  //   https://chat.zulip.org/#narrow/stream/2-general/topic/.22unavailable.22.20status/near/1454779
  // TODO(server-6.0): Remove this `if` block and the `status` parameter.
  if (zulipFeatureLevel < 148 && status.away && differenceInDays(Date.now(), lastTimeActive) < 1) {
    // Be vague when an unavailable user is recently online.
    // TODO: This phrasing doesn't really match the logic and can be misleading.
    return 'today';
  }

  return differenceInSeconds(Date.now(), lastTimeActive) < OFFLINE_THRESHOLD_SECS
    ? 'now'
    : `${formatDistanceToNow(lastTimeActive)} ago`;
};

export const statusFromPresence = (presence: UserPresence | void): PresenceStatus => {
  if (!presence || !presence.aggregated) {
    return 'offline';
  }

  if (presence.aggregated.status === 'offline') {
    return 'offline';
  }

  const timestampDate = new Date(presence.aggregated.timestamp * 1000);
  const diffToNowInSeconds = differenceInSeconds(Date.now(), timestampDate);

  if (diffToNowInSeconds > OFFLINE_THRESHOLD_SECS) {
    return 'offline';
  }

  return presence.aggregated.status;
};

// TODO(server-6.0): Remove; UserStatus['away'] was deprecated at FL 148.
export const statusFromPresenceAndUserStatus = (
  presence: UserPresence | void,
  userStatus: UserStatus,
): PresenceStatus | 'unavailable' =>
  userStatus.away ? 'unavailable' : statusFromPresence(presence);

/**
 * Get a user's overall presence status, aggregated from all their devices.
 *
 * Gives null when we're missing data to determine this, such as when the
 * user doesn't exist.
 */
export const getPresenceStatusForUserId = (
  state: PerAccountState,
  userId: UserId,
): PresenceStatus | 'unavailable' | null => {
  const presence = getPresence(state);
  const user = tryGetUserForId(state, userId);
  if (!user) {
    return null;
  }
  const userPresence = getUserPresenceByEmail(presence, user.email);
  if (!userPresence || !userPresence.aggregated) {
    return null;
  }
  const userStatus = getUserStatus(state, userId);

  // "Invisible mode", new in FL 148, doesn't involve UserStatus['away']:
  //   https://chat.zulip.org/#narrow/stream/2-general/topic/.22unavailable.22.20status/near/1454779
  // TODO(server-6.0): Simplify to just statusFromPresence.
  return getZulipFeatureLevel(state) >= 148
    ? statusFromPresence(userPresence)
    : statusFromPresenceAndUserStatus(userPresence, userStatus);
};

//
//
// Reducer.
//

const initialState: PresenceState = {
  byEmail: Immutable.Map(),
};

export function reducer(
  state: PresenceState = initialState, // eslint-disable-line default-param-last
  action: PerAccountApplicableAction,
): PresenceState {
  switch (action.type) {
    case RESET_ACCOUNT_DATA:
      return initialState;

    case REGISTER_COMPLETE: {
      // TODO(#5102): Delete fallback once we enforce any threshold for
      //   ancient servers we refuse to connect to. It was added in
      //   #2878 (2018-11-16), but it wasn't clear even then, it seems,
      //   whether any servers actually omit the data. The API doc
      //   doesn't mention any servers that omit it, and our Flow types
      //   mark it required.
      const data = action.data.presences ?? {};
      return {
        byEmail: Immutable.Map(data),
      };
    }

    case PRESENCE_RESPONSE:
      return {
        ...state,
        byEmail: state.byEmail.merge(action.presence),
      };

    case EVENT_PRESENCE: {
      // A presence event should have either "active" or "idle" status
      const isPresenceEventValid = !!objectEntries(action.presence).find(
        ([device, devicePresence]) => ['active', 'idle'].includes(devicePresence.status),
      );
      if (!isPresenceEventValid) {
        return state;
      }

      return {
        ...state,
        byEmail: state.byEmail.update(action.email, (userPresence: UserPresence): UserPresence =>
          // $FlowIssue[cannot-spread-indexer] https://github.com/facebook/flow/issues/8276
          ({
            ...userPresence,
            ...action.presence,
            // $FlowIssue[cannot-spread-indexer] https://github.com/facebook/flow/issues/8276
            aggregated: getAggregatedPresence({
              ...userPresence,
              ...action.presence,
            }),
          }),
        ),
      };
    }

    default:
      return state;
  }
}
