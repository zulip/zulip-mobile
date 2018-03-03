/* @flow */
import type { Presence } from '../types';

const OFFLINE_THRESHOLD_SECS = 140;

export const getAggregatedPresence = (presence: Presence) =>
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
