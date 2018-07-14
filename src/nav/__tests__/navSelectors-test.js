import deepFreeze from 'deep-freeze';
import {
  getCanGoBack,
  getCurrentRoute,
  getCurrentRouteParams,
  getCurrentRouteNarrow,
  getSameRoutesCount,
  getSameRoutesAndParamsCount,
  getPreviousDifferentRoute,
  getPreviousDifferentRouteAndParams,
  getTopMostNarrow,
} from '../navSelectors';
import { streamNarrow } from '../../utils/narrow';

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

describe('getSameRoutesAndParamsCount', () => {
  test('if params of the routes differ consider them different routes', () => {
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

    const count = getSameRoutesAndParamsCount(state);

    expect(count).toEqual(1);
  });
});

describe('getPreviousDifferentRoute', () => {
  test('if no routes previous route is empty', () => {
    const state = deepFreeze({
      nav: {
        routes: [],
      },
    });

    const count = getPreviousDifferentRoute(state);

    expect(count).toEqual('');
  });

  test('if only one route previous route is empty', () => {
    const state = deepFreeze({
      nav: {
        routes: [{ key: 'main-1', routeName: 'main' }],
      },
    });

    const count = getPreviousDifferentRoute(state);

    expect(count).toEqual('');
  });

  test('if last route differs from  routes the last of same routes is the previous item', () => {
    const state = deepFreeze({
      nav: {
        routes: [{ key: 'main-1', routeName: 'main' }, { key: 'chat-1', routeName: 'chat' }],
      },
    });

    const count = getPreviousDifferentRoute(state);

    expect(count).toEqual('main-1');
  });

  test('if several of the last routes are the same return the first different route', () => {
    const state = deepFreeze({
      nav: {
        routes: [
          { key: 'login-1', routeName: 'login' },
          { key: 'main-1', routeName: 'main' },
          { key: 'chat-1', routeName: 'chat' },
          { key: 'chat-2', routeName: 'chat' },
          { key: 'chat-3', routeName: 'chat' },
        ],
      },
    });

    const count = getPreviousDifferentRoute(state);

    expect(count).toEqual('main-1');
  });

  test('if all routes are the same return the first one', () => {
    const state = deepFreeze({
      nav: {
        routes: [
          { key: 'chat-1', routeName: 'chat' },
          { key: 'chat-2', routeName: 'chat' },
          { key: 'chat-3', routeName: 'chat' },
        ],
      },
    });

    const count = getPreviousDifferentRoute(state);

    expect(count).toEqual('chat-1');
  });
});

describe('getPreviousDifferentRouteAndParams', () => {
  test('if params of the routes differ consider them different routes', () => {
    const state = deepFreeze({
      nav: {
        routes: [
          { key: 'loading', routeName: 'login' },
          { key: 'main', routeName: 'main' },
          { key: 'chat-1', routeName: 'chat', params: { key: 'value' } },
          { key: 'chat-2', routeName: 'chat', params: { key: 'another value' } },
          { key: 'chat-3', routeName: 'chat', params: { anotherKey: 'some value' } },
        ],
      },
    });

    const count = getPreviousDifferentRouteAndParams(state);

    expect(count).toEqual('chat-2');
  });
});

describe('getCurrentRoute', () => {
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

    const actualResult = getCurrentRoute(state);

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

describe('getCurrentRouteNarrow', () => {
  test('when no params are passed do not return "undefined"', () => {
    const state = deepFreeze({
      nav: {
        index: 0,
        routes: [{ routeName: 'chat' }],
      },
    });

    const actualResult = getCurrentRouteNarrow(state);

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
