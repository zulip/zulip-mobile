/* @flow */

import { filterOutOutdatedPresence } from '../presence';

const currentTimestamp = Date.now() / 1000;

describe('filterOutOutdatedPresence', () => {
  test('filter out out dated presence objects', () => {
    const presences = {
      'a@a.com': {
        website: {
          timestamp: currentTimestamp - 10,
        },
      },
      'b@a.com': {
        aggregated: {
          client: 'website',
        },
      },
      'c@a.com': {
        aggregated: {
          timestamp: currentTimestamp - 80,
        },
      },
      'd@a.com': {
        aggregated: {
          timestamp: currentTimestamp - 800,
        },
      },
    };

    const expectedResult = {
      'c@a.com': {
        aggregated: {
          timestamp: currentTimestamp - 80,
        },
      },
    };

    expect(filterOutOutdatedPresence(presences)).toEqual(expectedResult);
  });
});
