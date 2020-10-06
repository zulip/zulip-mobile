import deepFreeze from 'deep-freeze';

import { INITIAL_FETCH_COMPLETE } from '../../actionConstants';
import navReducer, { getStateForRoute } from '../navReducer';
import NavigationService from '../NavigationService';

describe('navReducer', () => {
  describe('INITIAL_FETCH_COMPLETE', () => {
    test('do not mutate navigation state if already at the same route', () => {
      NavigationService.getState = jest.fn().mockReturnValue(
        deepFreeze({
          index: 0,
          routes: [{ routeName: 'main' }],
        }),
      );
      const prevState = getStateForRoute('main');

      const action = deepFreeze({
        type: INITIAL_FETCH_COMPLETE,
      });

      const newState = navReducer(prevState, action);

      expect(newState).toBe(prevState);
    });
  });
});
