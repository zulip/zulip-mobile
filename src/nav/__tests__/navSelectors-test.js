import deepFreeze from 'deep-freeze';

import {
  getCurrentRouteName,
  getCurrentRouteParams,
  getChatScreenParams,
  getCanGoBack,
} from '../navSelectors';

describe('getCurrentRouteName', () => {
  test('return name of the current route', () => {
    const state = deepFreeze({
      nav: {
        index: 1,
        routes: [
          { routeName: 'first', params: { email: 'a@a.com' } },
          { routeName: 'second', params: { email: 'b@a.com' } },
        ],
      },
    });
    const expectedResult = 'second';

    const actualResult = getCurrentRouteName(state);

    expect(actualResult).toEqual(expectedResult);
  });
});

describe('getCurrentRouteParams', () => {
  test('return "undefined" even when there is no data', () => {
    const state = deepFreeze({
      nav: {},
    });

    const actualResult = getCurrentRouteParams(state);

    expect(actualResult).toBe(undefined);
  });

  test('return params of the current route', () => {
    const state = deepFreeze({
      nav: {
        index: 1,
        routes: [
          { routeName: 'first', params: { email: 'a@a.com' } },
          { routeName: 'second', params: { email: 'b@a.com' } },
        ],
      },
    });
    const expectedResult = { email: 'b@a.com' };

    const actualResult = getCurrentRouteParams(state);

    expect(actualResult).toEqual(expectedResult);
  });
});

describe('getChatScreenParams', () => {
  test('when no params are passed do not return "undefined"', () => {
    const state = deepFreeze({
      nav: {
        index: 0,
        routes: [{ routeName: 'chat' }],
      },
    });

    const actualResult = getChatScreenParams(state);

    expect(actualResult).toBeDefined();
  });
});

describe('getCanGoBack', () => {
  test('return true if current route in the stack is not the only route', () => {
    const state = deepFreeze({
      nav: {
        index: 1,
      },
    });
    expect(getCanGoBack(state)).toBe(true);
  });

  test('return false if current route in the stack is the only route', () => {
    const state = deepFreeze({
      nav: {
        index: 0,
      },
    });
    expect(getCanGoBack(state)).toBe(false);
  });
});
