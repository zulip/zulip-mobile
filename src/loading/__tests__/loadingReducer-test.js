/* @flow strict-local */
import deepFreeze from 'deep-freeze';

import loadingReducer from '../loadingReducer';
import { ACCOUNT_SWITCH } from '../../actionConstants';

describe('loadingReducer', () => {
  describe('ACCOUNT_SWITCH', () => {
    test('resets state to nothing is loading', () => {
      const initialState = deepFreeze({
        unread: true,
      });

      const action = deepFreeze({
        type: ACCOUNT_SWITCH,
        index: 1,
      });

      const expectedState = {
        unread: false,
      };

      const actualState = loadingReducer(initialState, action);

      expect(actualState).toEqual(expectedState);
    });
  });
});
