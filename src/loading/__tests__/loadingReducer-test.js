import deepFreeze from 'deep-freeze';

import loadingReducers from '../loadingReducers';
import { ACCOUNT_SWITCH } from '../../actionConstants';

describe('loadingReducers', () => {
  describe('ACCOUNT_SWITCH', () => {
    test('resets state to nothing is loading', () => {
      const initialState = deepFreeze({
        presence: true,
        subscriptions: true,
        streams: true,
        unread: true,
        users: true,
      });

      const action = deepFreeze({
        type: ACCOUNT_SWITCH,
      });

      const expectedState = {
        presence: false,
        subscriptions: false,
        streams: false,
        unread: false,
        users: false,
      };

      const actualState = loadingReducers(initialState, action);

      expect(actualState).toEqual(expectedState);
    });
  });
});
