/* @flow */
import differenceInSeconds from 'date-fns/difference_in_seconds';
import distanceInWordsToNow from 'date-fns/distance_in_words_to_now';

import type { PresenceAggregated, Presence, UserStatus } from '../types';

const OFFLINE_THRESHOLD_SECS = 140;

export const getAggregatedPresence = (presence: Presence): PresenceAggregated =>
  Object.keys(presence)
    .filter((client: string) => client !== 'aggregated')
    .reduce(
      (aggregated, client: string) => {
        const { status, timestamp } = presence[client];
        if (Date.now() / 1000 - timestamp < OFFLINE_THRESHOLD_SECS) {
          switch (status) {
            case 'active':
              return { client, status, timestamp };
            case 'idle':
              if (aggregated.status !== 'active') {
                return { client, status, timestamp };
              }
              break;
            case 'offline':
              if (aggregated.status !== 'active' && aggregated.status !== 'idle') {
                return { client, status, timestamp };
              }
              break;
            default:
              return aggregated;
          }
        }
        return aggregated;
      },
      { client: '', status: 'offline', timestamp: 0 },
    );

export const presenceToHumanTime = (presence: Presence): string => {
  if (!presence || !presence.aggregated) {
    return 'never';
  }

  const lastTimeActive = new Date(presence.aggregated.timestamp * 1000);
  return differenceInSeconds(Date.now(), lastTimeActive) < OFFLINE_THRESHOLD_SECS
    ? 'now'
    : `${distanceInWordsToNow(lastTimeActive)} ago`;
};

export const statusFromPresence = (presence?: Presence): UserStatus => {
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
