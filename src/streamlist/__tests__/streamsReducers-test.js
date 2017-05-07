import streamsReducers from '../streamsReducers';
import {
  ACCOUNT_SWITCH,
} from '../../actionConstants';

describe('streamsReducers', () => {
  describe('ACCOUNT_SWITCH', () => {
    test('resets state to initial state', () => {
      const initialState = ['some_stream'];
      const action = {
        type: ACCOUNT_SWITCH,
      };
      const expectedState = [];

      const actualState = streamsReducers(initialState, action);

      expect(actualState).toEqual(expectedState);
    });
  });
});
