/* @flow strict-local */
import deepFreeze from 'deep-freeze';

import { navigateBack } from '../navActions';
import * as NavigationService from '../NavigationService';

describe('navigateBack', () => {
  test('if no routes the count of same routes is 0', () => {
    // $FlowFixMe[cannot-write] Make Flow understand about mocking.
    NavigationService.getState = jest.fn().mockReturnValue(
      deepFreeze({
        routes: [],
      }),
    );

    const action = navigateBack();
    expect(action).toMatchObject({ type: 'POP', payload: { count: 0 } });
  });

  test('if last route differs from  routes the count of same routes is 0', () => {
    // $FlowFixMe[cannot-write] Make Flow understand about mocking.
    NavigationService.getState = jest.fn().mockReturnValue(
      deepFreeze({
        routes: [{ name: 'main-tabs' }, { name: 'chat' }],
      }),
    );

    const action = navigateBack();
    expect(action).toMatchObject({ type: 'POP', payload: { count: 1 } });
  });

  test('if several of the routes are the same ignore the params and return their count', () => {
    // $FlowFixMe[cannot-write] Make Flow understand about mocking.
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

    const action = navigateBack();
    expect(action).toMatchObject({ type: 'POP', payload: { count: 3 } });
  });
});
