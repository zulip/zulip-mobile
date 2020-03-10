/* @flow strict-local */
import differenceInSeconds from 'date-fns/difference_in_seconds';
import differenceInDays from 'date-fns/difference_in_days';
import distanceInWordsToNow from 'date-fns/distance_in_words_to_now';

import type { ClientPresence, UserPresence, PresenceStatus, UserStatus } from '../types';
import { ensureUnreachable } from '../types';
import objectEntries from './objectEntries';

/** The relation `>=`, where `active` > `idle` > `offline`. */
const presenceStatusGeq = (a: PresenceStatus, b: PresenceStatus): boolean => {
  /* prettier-ignore */ /* eslint-disable no-multi-spaces */
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
  /* Out of the ClientPresence objects found in `presence`, we consider only
   * those with a timestamp newer than OFFLINE_THRESHOLD_SECS; then of
   * those, return the one that has the greatest PresenceStatus, where
   * `active` > `idle` > `offline`.
   *
   * If there are several ClientPresence objects with the greatest
   * PresenceStatus, an arbitrary one is chosen.
   */

  let status = 'offline';
  let client = '';
  let timestamp = 0;

  for (const [device, devicePresence] of objectEntries(presence)) {
    if (device === 'aggregated') {
      continue;
    }

    const age = Date.now() / 1000 - devicePresence.timestamp;
    if (age < OFFLINE_THRESHOLD_SECS) {
      if (presenceStatusGeq(devicePresence.status, status)) {
        client = device;
        status = devicePresence.status;
        timestamp = devicePresence.timestamp;
      }
    }
  }

  return { client, status, timestamp };
};

export const presenceToHumanTime = (presence: UserPresence, status?: UserStatus): string => {
  if (!presence || !presence.aggregated) {
    return 'never';
  }

  const lastTimeActive = new Date(presence.aggregated.timestamp * 1000);

  if (status && status.away && differenceInDays(Date.now(), lastTimeActive) < 1) {
    // Be vague when an unavailable user is recently online.
    // TODO: This phrasing doesn't really match the logic and can be misleading.
    return 'today';
  }

  return differenceInSeconds(Date.now(), lastTimeActive) < OFFLINE_THRESHOLD_SECS
    ? 'now'
    : `${distanceInWordsToNow(lastTimeActive)} ago`;
};

export const statusFromPresence = (presence?: UserPresence): PresenceStatus => {
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

export const statusFromPresenceAndUserStatus = (
  presence?: UserPresence,
  userStatus?: UserStatus,
): PresenceStatus | 'unavailable' =>
  userStatus && userStatus.away ? 'unavailable' : statusFromPresence(presence);
