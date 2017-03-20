import muteReducers from '../muteReducers';
import {
  ACCOUNT_SWITCH,
} from '../../constants';

describe('muteReducers', () => {
  describe('ACCOUNT_SWITCH', () => {
    test('resets state to initial state', () => {
      const initialState = ['some_topic'];
      const action = {
        type: ACCOUNT_SWITCH,
      };
      const expectedState = [];

      const actualState = muteReducers(initialState, action);

      expect(actualState).toEqual(expectedState);
    });
  });
});
