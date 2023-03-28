/* @flow strict-local */

import deepFreeze from 'deep-freeze';

import * as eg from '../../__tests__/lib/exampleData';
import { PRESENCE_RESPONSE, EVENT_PRESENCE } from '../../actionConstants';
import { reducer as presenceReducer } from '../presenceModel';
import { makePresenceState } from './presence-testlib';

const currentTimestamp = Date.now() / 1000;

describe('presenceReducer', () => {
  describe('REGISTER_COMPLETE', () => {
    test('when `presence` data is provided init state with it', () => {
      const user = eg.otherUser;
      const userPresence = {
        aggregated: { client: 'website', status: 'active', timestamp: 123 },
        website: { client: 'website', status: 'active', timestamp: 123 },
      };
      const prevState = deepFreeze(eg.baseReduxState.presence);
      const action = eg.mkActionRegisterComplete({
        presences: { [user.email]: userPresence },
      });
      const expectedState = makePresenceState([[user, userPresence]]);
      expect(presenceReducer(prevState, action)).toEqual(expectedState);
    });

    // TODO(#5102): Delete; see comment on implementation.
    test('when no `presence` data is given reset state', () => {
      const user = eg.otherUser;
      const userPresence = {
        aggregated: { client: 'website', status: 'active', timestamp: 123 },
        website: { client: 'website', status: 'active', timestamp: 123 },
      };
      const prevState = makePresenceState([[user, userPresence]]);
      const action = eg.mkActionRegisterComplete({
        // Hmm, we should need a Flow suppression here. This property is
        // marked required in InitialData, and this explicit undefined is
        // meant to defy that; see TODO(#5102) above.
        // mkActionRegisterComplete is designed to accept input with this or
        // any property *omitted*… and I think, as a side effect of handling
        // that, Flow mistakenly accepts an explicit undefined here, so it
        // doesn't catch the resulting malformed InitialData.
        presences: undefined,
      });
      const expectedState = makePresenceState([]);
      expect(presenceReducer(prevState, action)).toEqual(expectedState);
    });
  });

  describe('PRESENCE_RESPONSE', () => {
    test('merges a single user in presence response', () => {
      const user = eg.otherUser;
      const userPresence1 = {
        aggregated: { status: 'active', timestamp: 8, client: 'zulipMobile' },
        zulipMobile: { status: 'active', timestamp: 8, client: 'zulipMobile' },
      };
      const userPresence2 = {
        aggregated: { status: 'active', timestamp: 123, client: 'website' },
        website: { status: 'active', timestamp: 123, client: 'website' },
      };

      const prevState = makePresenceState([[user, userPresence1]]);
      const action = deepFreeze({
        type: PRESENCE_RESPONSE,
        presence: { [user.email]: userPresence2 },
        serverTimestamp: 1474527537,
      });
      const expectedState = makePresenceState([[user, userPresence2]]);
      expect(presenceReducer(prevState, action)).toEqual(expectedState);
    });

    test('merges multiple users in presence response', () => {
      const [user1, user2, user3] = [eg.makeUser(), eg.otherUser, eg.thirdUser];
      const presence1a = {
        aggregated: { status: 'active', timestamp: 8, client: 'zulipMobile' },
        zulipMobile: { status: 'active', timestamp: 8, client: 'zulipMobile' },
      };
      const presence2 = {
        aggregated: { status: 'active', timestamp: 8, client: 'zulipMobile' },
        zulipMobile: { status: 'active', timestamp: 8, client: 'zulipMobile' },
      };
      const presence1b = {
        aggregated: { client: 'website', status: 'active', timestamp: 123 },
        website: { client: 'website', status: 'active', timestamp: 123 },
      };
      const presence3 = {
        aggregated: { status: 'active', timestamp: 345, client: 'website' },
        website: { status: 'active', timestamp: 345, client: 'website' },
      };

      const prevState = makePresenceState([
        [user1, presence1a],
        [user2, presence2],
      ]);
      const action = deepFreeze({
        type: PRESENCE_RESPONSE,
        presence: { [user1.email]: presence1b, [user3.email]: presence3 },
        serverTimestamp: 12345,
      });
      const expectedState = makePresenceState([
        [user1, presence1b],
        [user2, presence2],
        [user3, presence3],
      ]);
      expect(presenceReducer(prevState, action)).toEqual(expectedState);
    });
  });

  describe('EVENT_PRESENCE', () => {
    test('merges a single user presence', () => {
      const user = eg.otherUser;
      const clientPresence1 = {
        client: 'website',
        status: 'idle',
        timestamp: currentTimestamp - 20,
      };
      const clientPresence2 = {
        client: 'zulipMobile',
        status: 'active',
        timestamp: currentTimestamp - 10,
      };

      const prevState = makePresenceState([
        [user, { aggregated: clientPresence1, website: clientPresence1 }],
      ]);
      const action = deepFreeze({
        id: 1,
        type: EVENT_PRESENCE,
        email: user.email,
        server_timestamp: 200,
        presence: { zulipMobile: clientPresence2 },
      });
      const expectedState = makePresenceState([
        [
          user,
          { aggregated: clientPresence2, website: clientPresence1, zulipMobile: clientPresence2 },
        ],
      ]);
      expect(presenceReducer(prevState, action)).toEqual(expectedState);
    });
  });

  describe('RESET_ACCOUNT_DATA', () => {
    test('resets state to initial state', () => {
      const user = eg.otherUser;
      const userPresence = {
        aggregated: { status: 'active', timestamp: 8, client: 'zulipMobile' },
        zulipMobile: { status: 'active', timestamp: 8, client: 'zulipMobile' },
      };
      const prevState = makePresenceState([[user, userPresence]]);
      const action = eg.action.reset_account_data;
      const expectedState = makePresenceState([]);
      expect(presenceReducer(prevState, action)).toEqual(expectedState);
    });
  });
});
