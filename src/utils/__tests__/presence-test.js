/* @flow */

import { getAggregatedPresence } from '../presence';

const currentTimestamp = Date.now() / 1000;

describe('getAggregatedPresence', () => {
  test('aggregated status is active if any of the client has status active with age less than threshold', () => {
    const presence = {
      website: {
        timestamp: currentTimestamp - 100,
        status: 'idle',
      },
      zulipMobile: {
        timestamp: currentTimestamp - 120,
        status: 'active',
      },
    };

    const expectedResult = {
      client: 'zulipMobile',
      status: 'active',
      timestamp: currentTimestamp - 120,
    };

    expect(getAggregatedPresence(presence)).toEqual(expectedResult);
  });

  test('aggregated status is idle if any of the client has status idle with age less than threshold and no client has status active with age has than threshold', () => {
    const presence = {
      website: {
        timestamp: currentTimestamp - 100,
        status: 'idle',
      },
      zulipMobile: {
        timestamp: currentTimestamp - 220,
        status: 'active',
      },
    };

    const expectedResult = {
      client: 'website',
      status: 'idle',
      timestamp: currentTimestamp - 100,
    };

    expect(getAggregatedPresence(presence)).toEqual(expectedResult);
  });

  test('aggregated status is offline if no client has status active or idle with age less than threshold', () => {
    const presence = {
      zulipMobile: {
        timestamp: currentTimestamp - 400,
        status: 'active',
      },
      website: {
        timestamp: currentTimestamp - 200,
        status: 'idle',
      },
      zulipAndroid: {
        timestamp: currentTimestamp - 500,
        status: 'active',
      },
    };

    const expectedResult = {
      client: '',
      timestamp: 0,
      status: 'offline',
    };

    expect(getAggregatedPresence(presence)).toEqual(expectedResult);
  });

  test('do not consider presence if its age is greater than OFFLINE_THRESHOLD_SECS', () => {
    const presence = {
      website: {
        timestamp: currentTimestamp - 300,
        status: 'active',
      },
      zulipMobile: {
        timestamp: currentTimestamp - 10,
        status: 'idle',
      },
    };

    const expectedResult = {
      client: 'zulipMobile',
      status: 'idle',
      timestamp: currentTimestamp - 10,
    };

    expect(getAggregatedPresence(presence)).toEqual(expectedResult);
  });

  test('Do not consider old aggregated', () => {
    const presence = {
      aggregated: {
        client: 'website',
        status: 'active',
        timestamp: currentTimestamp - 100,
      },
      website: {
        status: 'idle',
        timestamp: currentTimestamp - 10,
      },
    };

    const expectedResult = {
      client: 'website',
      status: 'idle',
      timestamp: currentTimestamp - 10,
    };

    expect(getAggregatedPresence(presence)).toEqual(expectedResult);
  });
});
