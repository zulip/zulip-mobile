// @flow strict-local
import type { User, UserPresence } from '../../api/modelTypes';
import { type PresenceState } from '../../reduxTypes';
import { reducer } from '../presenceModel';
import * as eg from '../../__tests__/lib/exampleData';
import { objectFromEntries } from '../../jsBackport';

export function makePresenceState(
  data: $ReadOnlyArray<[User, UserPresence]>,
  args?: {|
    +offlineThresholdSeconds?: number,
    +pingIntervalSeconds?: number,
  |},
): PresenceState {
  const { offlineThresholdSeconds, pingIntervalSeconds } = args ?? {};
  return reducer(
    undefined,
    eg.mkActionRegisterComplete({
      presences: objectFromEntries(data.map(([user, presence]) => [user.email, presence])),
      server_presence_offline_threshold_seconds: offlineThresholdSeconds ?? 140,
      server_presence_ping_interval_seconds: pingIntervalSeconds ?? 60,
    }),
  );
}
