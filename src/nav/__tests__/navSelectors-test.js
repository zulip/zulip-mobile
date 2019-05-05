import deepFreeze from 'deep-freeze';

import { streamNarrow } from '../../utils/narrow';
import {
  getCurrentRouteName,
  getCurrentRouteParams,
  getChatScreenParams,
  getTopMostNarrow,
  getCanGoBack,
  getSameRoutesCount,
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

describe('getTopMostNarrow', () => {
  test('return undefined if no chat screen are in stack', () => {
    const state = deepFreeze({
      nav: {
        index: 0,
        routes: [{ routeName: 'main' }],
      },
    });
    expect(getTopMostNarrow(state)).toBe(undefined);
  });

  test('return narrow of first chat screen from top', () => {
    const narrow = streamNarrow('all');
    const state = deepFreeze({
      nav: {
        index: 1,
        routes: [{ routeName: 'main' }, { routeName: 'chat', params: { narrow } }],
      },
    });
    expect(getTopMostNarrow(state)).toEqual(narrow);
  });

  test('iterate over stack to get first chat screen', () => {
    const narrow = streamNarrow('all');
    const state = deepFreeze({
      nav: {
        index: 2,
        routes: [
          { routeName: 'main' },
          { routeName: 'chat', params: { narrow } },
          { routeName: 'account' },
        ],
      },
    });
    expect(getTopMostNarrow(state)).toEqual(narrow);
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

describe('getSameRoutesCount', () => {
  test('if no routes the count of same routes is 0', () => {
    const state = deepFreeze({
      nav: {
        routes: [],
      },
    });

    const count = getSameRoutesCount(state);

    expect(count).toEqual(0);
  });

  test('if last route differs from  routes the count of same routes is 0', () => {
    const state = deepFreeze({
      nav: {
        routes: [{ routeName: 'main' }, { routeName: 'chat' }],
      },
    });

    const count = getSameRoutesCount(state);

    expect(count).toEqual(1);
  });

  test('if several of the routes are the same ignore the params and return their count', () => {
    const state = deepFreeze({
      nav: {
        routes: [
          { routeName: 'login' },
          { routeName: 'main' },
          { routeName: 'chat', params: { key: 'value' } },
          { routeName: 'chat', params: { key: 'another value' } },
          { routeName: 'chat', params: { anotherKey: 'some value' } },
        ],
      },
    });

    const count = getSameRoutesCount(state);

    expect(count).toEqual(3);
  });
});
