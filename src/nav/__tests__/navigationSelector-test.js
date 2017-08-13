import deepFreeze from 'deep-freeze';
import {
  getNavigationRoutes,
  getNavigationIndex,
  getCurrentRouteParams,
  getCurrentRouteName,
} from '../navigationSelectors';

describe('getNavigationRoutes', () => {
  test('return routes in navigation stack', () => {
    const state = {
      nav: {
        index: 1,
        routes: [{ routeName: 'first' }, { routeName: 'second' }],
      },
    };
    deepFreeze(state);
    const expectedResult = [{ routeName: 'first' }, { routeName: 'second' }];
    const actualResult = getNavigationRoutes(state);

    expect(actualResult).toEqual(expectedResult);
  });
});

describe('getNavigationIndex', () => {
  test('return index of the current route in navigation', () => {
    const state = {
      nav: {
        index: 1,
        routes: [{ routeName: 'first' }, { routeName: 'second' }],
      },
    };
    deepFreeze(state);
    const expectedResult = 1;
    const actualResult = getNavigationIndex(state);

    expect(actualResult).toEqual(expectedResult);
  });
});

describe('getCurrentRouteParams', () => {
  test('return params of the current route', () => {
    const state = {
      nav: {
        index: 1,
        routes: [
          { routeName: 'first', params: { email: 'a@a.com' } },
          { routeName: 'second', params: { email: 'b@a.com' } },
        ],
      },
    };
    deepFreeze(state);
    const expectedResult = { email: 'b@a.com' };
    const actualResult = getCurrentRouteParams(state);

    expect(actualResult).toEqual(expectedResult);
  });
});

describe('getCurrentRouteName', () => {
  test('return name of the current route', () => {
    const state = {
      nav: {
        index: 1,
        routes: [
          { routeName: 'first', params: { email: 'a@a.com' } },
          { routeName: 'second', params: { email: 'b@a.com' } },
        ],
      },
    };
    deepFreeze(state);
    const expectedResult = 'second';
    const actualResult = getCurrentRouteName(state);

    expect(actualResult).toEqual(expectedResult);
  });
});
