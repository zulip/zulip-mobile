import deepFreeze from 'deep-freeze';

import { INITIAL_FETCH_COMPLETE } from '../../actionConstants';
import navReducer, { getStateForRoute } from '../navReducer';

describe('navReducer', () => {
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
