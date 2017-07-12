import muteReducers from '../muteReducers';
import { ACCOUNT_SWITCH, EVENT_MUTED_TOPICS } from '../../actionConstants';

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

  describe('EVENT_MUTED_TOPICS', () => {
    test('appends and test a new muted topic', () => {
      const initialState = [];
      const action = {
        type: EVENT_MUTED_TOPICS,
        muted_topics: [[['stream'], ['topic']]],
      };
      const expectedState = [[['stream'], ['topic']]];

      const newState = muteReducers(initialState, action);

      expect(newState).toEqual(expectedState);
      expect(newState).not.toBe(initialState);
    });
  });
});
