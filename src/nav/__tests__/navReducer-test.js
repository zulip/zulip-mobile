import deepFreeze from 'deep-freeze';

import { LOGIN_SUCCESS, INITIAL_FETCH_COMPLETE } from '../../actionConstants';
import navReducer, { getStateForRoute } from '../navReducer';

describe('navReducer', () => {
  describe('LOGIN_SUCCESS', () => {
    test('replaces the existing route stack with "loading" on sign in', () => {
      const prevState = deepFreeze({
        index: 2,
        routes: [{ key: 'one' }, { key: 'two' }, { key: 'password' }],
      });

      const action = deepFreeze({
        type: LOGIN_SUCCESS,
      });

      const expectedState = {
        index: 0,
        routes: [{ routeName: 'loading' }],
      };

      const newState = navReducer(prevState, action);

      expect(newState.index).toEqual(expectedState.index);
      expect(newState.routes[0].routeName).toEqual(expectedState.routes[0].routeName);
    });
  });

  describe('INITIAL_FETCH_COMPLETE', () => {
    test('do not mutate navigation state if already at the same route', () => {
      const prevState = getStateForRoute('main');

      const action = deepFreeze({
        type: INITIAL_FETCH_COMPLETE,
      });

      const newState = navReducer(prevState, action);

      expect(newState).toBe(prevState);
    });
  });
});
