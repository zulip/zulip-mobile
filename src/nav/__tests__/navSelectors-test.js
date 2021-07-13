import deepFreeze from 'deep-freeze';

import { getSameRoutesCount } from '../navSelectors';
import * as NavigationService from '../NavigationService';

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
        routes: [{ name: 'main-tabs' }, { name: 'chat' }],
      }),
    );

    const count = getSameRoutesCount();

    expect(count).toEqual(1);
  });

  test('if several of the routes are the same ignore the params and return their count', () => {
    NavigationService.getState = jest.fn().mockReturnValue(
      deepFreeze({
        routes: [
          { name: 'login' },
          { name: 'main-tabs' },
          { name: 'chat', params: { key: 'value' } },
          { name: 'chat', params: { key: 'another value' } },
          { name: 'chat', params: { anotherKey: 'some value' } },
        ],
      }),
    );

    const count = getSameRoutesCount();

    expect(count).toEqual(3);
  });
});
