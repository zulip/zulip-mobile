import eventReducers from '../eventReducers';
import {
  ACCOUNT_SWITCH,
} from '../../actionConstants';

describe('eventReducers', () => {
  describe('ACCOUNT_SWITCH', () => {
    test('resets state to initial state', () => {
      const initialState = {
        queueId: 123,
      };
      const action = {
        type: ACCOUNT_SWITCH,
      };
      const expectedState = {
        queueId: null,
      };

      const actualState = eventReducers(initialState, action);

      expect(actualState).toEqual(expectedState);
    });
  });
});
