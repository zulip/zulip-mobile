import deepFreeze from 'deep-freeze';

import {
  getCurrentRouteName,
  getCurrentRouteParams,
  getChatScreenParams,
  getSameRoutesCount,
} from '../navSelectors';
import * as NavigationService from '../NavigationService';

describe('getCurrentRouteName', () => {
  test('return name of the current route', () => {
    NavigationService.getState = jest.fn().mockReturnValue(
      deepFreeze({
        index: 1,
        routes: [
          { routeName: 'first', params: { email: 'a@a.com' } },
          { routeName: 'second', params: { email: 'b@a.com' } },
        ],
      }),
    );

    const expectedResult = 'second';

    const actualResult = getCurrentRouteName();

    expect(actualResult).toEqual(expectedResult);
  });
});

describe('getCurrentRouteParams', () => {
  test('return params of the current route', () => {
    NavigationService.getState = jest.fn().mockReturnValue(
      deepFreeze({
        index: 1,
        routes: [
          { routeName: 'first', params: { email: 'a@a.com' } },
          { routeName: 'second', params: { email: 'b@a.com' } },
        ],
      }),
    );
    const expectedResult = { email: 'b@a.com' };

    const actualResult = getCurrentRouteParams();

    expect(actualResult).toEqual(expectedResult);
  });
});

describe('getChatScreenParams', () => {
  test('when no params are passed do not return "undefined"', () => {
    NavigationService.getState = jest.fn().mockReturnValue(
      deepFreeze({
        index: 0,
        routes: [{ routeName: 'chat' }],
      }),
    );

    const actualResult = getChatScreenParams();

    expect(actualResult).toBeDefined();
  });
});

describe('getSameRoutesCount', () => {
  test('if no routes the count of same routes is 0', () => {
    NavigationService.getState = jest.fn().mockReturnValue(
      deepFreeze({
        routes: [],
      }),
    );

    const count = getSameRoutesCount();

    expect(count).toEqual(0);
  });

  test('if last route differs from  routes the count of same routes is 0', () => {
    NavigationService.getState = jest.fn().mockReturnValue(
      deepFreeze({
        routes: [{ routeName: 'main' }, { routeName: 'chat' }],
      }),
    );

    const count = getSameRoutesCount();

    expect(count).toEqual(1);
  });

  test('if several of the routes are the same ignore the params and return their count', () => {
    NavigationService.getState = jest.fn().mockReturnValue(
      deepFreeze({
        routes: [
          { routeName: 'login' },
          { routeName: 'main' },
          { routeName: 'chat', params: { key: 'value' } },
          { routeName: 'chat', params: { key: 'another value' } },
          { routeName: 'chat', params: { anotherKey: 'some value' } },
        ],
      }),
    );

    const count = getSameRoutesCount();

    expect(count).toEqual(3);
  });
});
