import deepFreeze from 'deep-freeze';

import muteReducers from '../muteReducers';
import { ACCOUNT_SWITCH, EVENT_MUTED_TOPICS, REALM_INIT } from '../../actionConstants';

describe('muteReducers', () => {
  describe('REALM_INIT', () => {
    test('when `mute` data is provided init state with it', () => {
      const initialState = deepFreeze([]);
      const action = deepFreeze({
        type: REALM_INIT,
        data: {
          muted_topics: [['stream'], ['topic']],
        },
      });

      const actualState = muteReducers(initialState, action);

      expect(actualState).toEqual([['stream'], ['topic']]);
    });

    test('when no `mute` data is given reset state', () => {
      const initialState = deepFreeze([['stream'], ['topic']]);
      const action = deepFreeze({
        type: REALM_INIT,
        data: {},
      });
      const expectedState = [];

      const actualState = muteReducers(initialState, action);

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

      const actualState = muteReducers(initialState, action);

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

      const newState = muteReducers(initialState, action);

      expect(newState).toEqual(expectedState);
      expect(newState).not.toBe(initialState);
    });
  });
});
