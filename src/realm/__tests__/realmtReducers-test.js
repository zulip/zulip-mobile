import realmReducers from '../realmReducers';
import {
  ACCOUNT_SWITCH,
} from '../../actionConstants';

describe('realmReducers', () => {
  describe('ACCOUNT_SWITCH', () => {
    test('resets state to initial state', () => {
      const initialState = {};
      const action = {
        type: ACCOUNT_SWITCH,
      };
      const expectedState = {
        twentyFourHourTime: false,
      };

      const actualState = realmReducers(initialState, action);

      expect(actualState).toEqual(expectedState);
    });
  });
});
