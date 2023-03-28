// @flow strict-local
import type { User, UserPresence } from '../../api/modelTypes';
import { type PresenceState } from '../../reduxTypes';
import reducer from '../presenceReducer';
import * as eg from '../../__tests__/lib/exampleData';
import { objectFromEntries } from '../../jsBackport';

export function makePresenceState(data: $ReadOnlyArray<[User, UserPresence]>): PresenceState {
  return reducer(
    undefined,
    eg.mkActionRegisterComplete({
      presences: objectFromEntries(data.map(([user, presence]) => [user.email, presence])),
    }),
  );
}
