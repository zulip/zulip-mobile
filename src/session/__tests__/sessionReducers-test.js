import deepFreeze from 'deep-freeze';

import { ACCOUNT_SWITCH, LOGIN_SUCCESS } from '../../actionConstants';
import sessionReducers from '../sessionReducers';

describe('sessionReducers', () => {
  describe('ACCOUNT_SWITCH', () => {
    test('reissues initial fetch', () => {
      const prevState = deepFreeze({});

      const action = deepFreeze({
        type: ACCOUNT_SWITCH,
      });

      const newState = sessionReducers(prevState, action);

      expect(newState.needsInitialFetch).toBe(true);
    });
  });

  describe('LOGIN_SUCCESS', () => {
    test('reissues initial fetch', () => {
      const prevState = deepFreeze({});

      const action = deepFreeze({
        type: LOGIN_SUCCESS,
      });

      const newState = sessionReducers(prevState, action);

      expect(newState.needsInitialFetch).toBe(true);
    });
  });
});
