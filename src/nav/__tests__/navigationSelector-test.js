import deepFreeze from 'deep-freeze';
import {
  getNavigationRoutes,
  getNavigationIndex,
  getCurrentRouteParams,
  getCurrentRoute,
} from '../navigationSelectors';

describe('getNavigationRoutes', () => {
  test('return routes in navigation stack', () => {
    const state = deepFreeze({
      nav: {
        index: 1,
        routes: [{ routeName: 'first' }, { routeName: 'second' }],
      },
    });
    const expectedResult = [{ routeName: 'first' }, { routeName: 'second' }];

    const actualResult = getNavigationRoutes(state);

    expect(actualResult).toEqual(expectedResult);
  });
});

describe('getNavigationIndex', () => {
  test('return index of the current route in navigation', () => {
    const state = deepFreeze({
      nav: {
        index: 1,
        routes: [{ routeName: 'first' }, { routeName: 'second' }],
      },
    });

    const actualResult = getNavigationIndex(state);

    expect(actualResult).toEqual(1);
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
