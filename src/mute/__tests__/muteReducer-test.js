import deepFreeze from 'deep-freeze';

import muteReducer from '../muteReducer';
import { ACCOUNT_SWITCH, EVENT_MUTED_TOPICS, REGISTER_COMPLETE } from '../../actionConstants';

describe('muteReducer', () => {
  describe('REGISTER_COMPLETE', () => {
    test('when `mute` data is provided init state with it', () => {
      const initialState = deepFreeze([]);
      const action = deepFreeze({
        type: REGISTER_COMPLETE,
        data: {
          muted_topics: [['stream'], ['topic']],
        },
      });

      const actualState = muteReducer(initialState, action);

      expect(actualState).toEqual([['stream'], ['topic']]);
    });

    test('when no `mute` data is given reset state', () => {
      const initialState = deepFreeze([['stream'], ['topic']]);
      const action = deepFreeze({
        type: REGISTER_COMPLETE,
        data: {},
      });
      const expectedState = [];

      const actualState = muteReducer(initialState, action);

      expect(actualState).toEqual(expectedState);
    });
  });

  describe('ACCOUNT_SWITCH', () => {
    test('resets state to initial state', () => {
      const initialState = deepFreeze(['some_topic']);

      const action = deepFreeze({
        type: ACCOUNT_SWITCH,
      });

      const expectedState = [];

      const actualState = muteReducer(initialState, action);

      expect(actualState).toEqual(expectedState);
    });
  });

  describe('EVENT_MUTED_TOPICS', () => {
    test('appends and test a new muted topic', () => {
      const initialState = deepFreeze([]);

      const action = deepFreeze({
        type: EVENT_MUTED_TOPICS,
        muted_topics: [[['stream'], ['topic']]],
      });

      const expectedState = [[['stream'], ['topic']]];

      const newState = muteReducer(initialState, action);

      expect(newState).toEqual(expectedState);
      expect(newState).not.toBe(initialState);
    });
  });
});
