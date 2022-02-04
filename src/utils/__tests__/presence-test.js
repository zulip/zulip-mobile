/* @flow strict-local */

import {
  getAggregatedPresence,
  presenceToHumanTime,
  statusFromPresence,
  statusFromPresenceAndUserStatus,
} from '../presence';

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

describe('presenceToHumanTime', () => {
  test('given a presence return human readable time', () => {
    expect(
      presenceToHumanTime(
        {
          aggregated: { client: 'website', status: 'active', timestamp: currentTimestamp - 240 },
        },
        { away: false, status_text: null, status_emoji: null },
      ),
    ).toBe('4 minutes ago');
  });

  test('if less than a threshold, the user is currently active', () => {
    expect(
      presenceToHumanTime(
        {
          aggregated: { client: 'website', status: 'active', timestamp: currentTimestamp - 100 },
        },
        { away: false, status_text: null, status_emoji: null },
      ),
    ).toBe('now');
  });

  test('if less than a day, and the user is "away" the user is ...', () => {
    expect(
      presenceToHumanTime(
        { aggregated: { client: 'website', status: 'active', timestamp: currentTimestamp - 100 } },
        { away: true, status_text: null, status_emoji: null },
      ),
    ).toBe('today');
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
