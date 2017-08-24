/* @flow */
import deepFreeze from 'deep-freeze';

import {
  getLocale,
  getTheme,
  getOnlineNotification,
  getOfflineNotification,
} from '../settingsSelectors';

describe('getLocale', () => {
  test('return current selected locale', () => {
    const state = {
      settings: {
        locale: 'en',
      },
    };
    deepFreeze(state);
    const expectedResult = 'en';
    const actualResult = getLocale(state);

    expect(actualResult).toEqual(expectedResult);
  });
});

describe('getTheme', () => {
  test('return current theme', () => {
    const state = {
      settings: {
        theme: 'night',
      },
    };
    deepFreeze(state);
    const expectedResult = 'night';
    const actualResult = getTheme(state);

    expect(actualResult).toEqual(expectedResult);
  });
});

describe('getOnlineNotification', () => {
  test('return status of online notification enabled or not', () => {
    const state = {
      settings: {
        onlineNotification: true,
      },
    };
    deepFreeze(state);
    const expectedResult = true;
    const actualResult = getOnlineNotification(state);

    expect(actualResult).toEqual(expectedResult);
  });
});

describe('getOfflineNotification', () => {
  test('return status of offline notification enabled or not', () => {
    const state = {
      settings: {
        offlineNotification: false,
      },
    };
    deepFreeze(state);
    const expectedResult = false;
    const actualResult = getOfflineNotification(state);

    expect(actualResult).toEqual(expectedResult);
  });
});
