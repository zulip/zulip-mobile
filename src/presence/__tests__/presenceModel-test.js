/* @flow strict-local */

import deepFreeze from 'deep-freeze';

import * as eg from '../../__tests__/lib/exampleData';
import { PRESENCE_RESPONSE, EVENT_PRESENCE } from '../../actionConstants';
import {
  reducer as presenceReducer,
  getAggregatedPresence,
  userLastActiveAsRelativeTimeString,
  statusFromPresence,
  statusFromPresenceAndUserStatus,
} from '../presenceModel';
import { makePresenceState } from './presence-testlib';

const currentTimestamp = Date.now() / 1000;

describe('getAggregatedPresence', () => {
  const oldAggregatedClientPresence = {
    client: 'website',
    timestamp: currentTimestamp - 10000,
    status: 'active',
  };

  test('aggregated status is active if any of the client has status active with age less than threshold', () => {
    expect(
      getAggregatedPresence({
        website: { client: 'website', timestamp: currentTimestamp - 100, status: 'idle' },
        zulipMobile: { client: 'zulipMobile', timestamp: currentTimestamp - 120, status: 'active' },
        aggregated: oldAggregatedClientPresence,
      }),
    ).toEqual({
      client: 'zulipMobile',
      status: 'active',
      timestamp: currentTimestamp - 100,
    });
  });

  test('aggregated status is idle if any of the client has status idle with age less than threshold and no client has status active with age has than threshold', () => {
    expect(
      getAggregatedPresence({
        website: { client: 'website', timestamp: currentTimestamp - 100, status: 'idle' },
        zulipMobile: { client: 'zulipMobile', timestamp: currentTimestamp - 220, status: 'active' },
        aggregated: oldAggregatedClientPresence,
      }),
    ).toEqual({ client: 'website', status: 'idle', timestamp: currentTimestamp - 100 });
  });

  test('aggregated status is offline if no client has status active or idle with age less than threshold', () => {
    expect(
      getAggregatedPresence({
        zulipMobile: { client: 'zulipMobile', timestamp: currentTimestamp - 400, status: 'active' },
        website: { client: 'website', timestamp: currentTimestamp - 200, status: 'idle' },
        zulipAndroid: {
          client: 'zulipAndroid',
          timestamp: currentTimestamp - 500,
          status: 'active',
        },
        aggregated: oldAggregatedClientPresence,
      }),
    ).toEqual({ client: '', timestamp: currentTimestamp - 200, status: 'offline' });
  });

  test('do not consider presence if its age is greater than OFFLINE_THRESHOLD_SECS', () => {
    expect(
      getAggregatedPresence({
        website: { client: 'website', timestamp: currentTimestamp - 300, status: 'active' },
        zulipMobile: { client: 'zulipMobile', timestamp: currentTimestamp - 10, status: 'idle' },
        aggregated: oldAggregatedClientPresence,
      }),
    ).toEqual({
      client: 'zulipMobile',
      status: 'idle',
      timestamp: currentTimestamp - 10,
    });
  });

  test('Do not consider old aggregated', () => {
    expect(
      getAggregatedPresence({
        aggregated: { client: 'website', status: 'active', timestamp: currentTimestamp - 100 },
        website: { client: 'website', status: 'idle', timestamp: currentTimestamp - 10 },
      }),
    ).toEqual({ client: 'website', status: 'idle', timestamp: currentTimestamp - 10 });
  });
});

describe('userLastActiveAsRelativeTimeString', () => {
  test('given a presence return a relative time', () => {
    expect(
      userLastActiveAsRelativeTimeString(
        {
          aggregated: { client: 'website', status: 'active', timestamp: currentTimestamp - 240 },
        },
        { away: false, status_text: null, status_emoji: null },
        eg.recentZulipFeatureLevel,
      ),
    ).toBe('4 minutes ago');
  });

  test('if less than a threshold, the user is currently active', () => {
    expect(
      userLastActiveAsRelativeTimeString(
        {
          aggregated: { client: 'website', status: 'active', timestamp: currentTimestamp - 100 },
        },
        { away: false, status_text: null, status_emoji: null },
        eg.recentZulipFeatureLevel,
      ),
    ).toBe('now');
  });

  // TODO(server-6.0): Remove
  test('Pre-FL 148: if less than a day and user is "away", use imprecise "today"', () => {
    expect(
      userLastActiveAsRelativeTimeString(
        { aggregated: { client: 'website', status: 'active', timestamp: currentTimestamp - 100 } },
        { away: true, status_text: null, status_emoji: null },
        147,
      ),
    ).toBe('today');
  });

  // TODO(server-6.0): Remove, once this test case is redundant with those
  //   above after the status parameter is gone.
  test('FL 148: if less than a day and user is "away", *don\'t* use imprecise "today"', () => {
    expect(
      userLastActiveAsRelativeTimeString(
        { aggregated: { client: 'website', status: 'active', timestamp: currentTimestamp - 100 } },
        { away: true, status_text: null, status_emoji: null },
        148,
      ),
    ).not.toBe('today');
  });
});

describe('statusFromPresence', () => {
  test('if aggregate status is "offline" the result is always "offline"', () => {
    expect(
      statusFromPresence({
        aggregated: { client: 'website', status: 'offline', timestamp: currentTimestamp - 100 },
      }),
    ).toBe('offline');
  });

  test('if status is not "offline" but last activity was more than 1hr ago result is still "offline"', () => {
    expect(
      statusFromPresence({
        aggregated: {
          client: 'website',
          status: 'active',
          timestamp: Math.trunc(Date.now() / 1000 - 2 * 60 * 60), // two hours
        },
      }),
    ).toBe('offline');
  });

  test('if status is  "idle" and last activity is less than 140 seconds then result remain "idle"', () => {
    expect(
      statusFromPresence({
        aggregated: {
          client: 'website',
          status: 'idle',
          timestamp: Math.trunc(Date.now() / 1000 - 60), // 1 minute
        },
      }),
    ).toBe('idle');
  });

  test('if status is not "offline" and last activity was less than 5min ago result is "active"', () => {
    expect(
      statusFromPresence({
        aggregated: {
          client: 'website',
          status: 'active',
          timestamp: Math.trunc(Date.now() / 1000 - 60), // 1 minute
        },
      }),
    ).toBe('active');
  });
});

describe('statusFromPresenceAndUserStatus', () => {
  test('if `userPresence` is provided but `away` is false do not change', () => {
    expect(
      statusFromPresenceAndUserStatus(
        { aggregated: { client: 'website', status: 'active', timestamp: currentTimestamp - 100 } },
        { away: false, status_text: 'Hello, world!', status_emoji: null },
      ),
    ).toBe('active');
  });

  test('if `userPresence` is provided and `away` is `true` override status with "unavailable"', () => {
    expect(
      statusFromPresenceAndUserStatus(
        { aggregated: { client: 'website', status: 'active', timestamp: currentTimestamp - 100 } },
        { away: true, status_text: null, status_emoji: null },
      ),
    ).toBe('unavailable');
  });
});

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
