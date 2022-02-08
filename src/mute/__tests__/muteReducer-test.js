/* @flow strict-local */
import deepFreeze from 'deep-freeze';

import muteReducer from '../muteReducer';
import { EVENT_MUTED_TOPICS } from '../../actionConstants';
import * as eg from '../../__tests__/lib/exampleData';

describe('muteReducer', () => {
  describe('REGISTER_COMPLETE', () => {
    test('when `mute` data is provided init state with it', () => {
      const initialState = deepFreeze([]);
      const action = eg.mkActionRegisterComplete({ muted_topics: [['stream', 'topic']] });

      const actualState = muteReducer(initialState, action);

      expect(actualState).toEqual([['stream', 'topic']]);
    });

    test('when no `mute` data is given reset state', () => {
      const initialState = deepFreeze([['stream', 'topic']]);
      const action = eg.mkActionRegisterComplete({ muted_topics: [] });
      const expectedState = [];

      const actualState = muteReducer(initialState, action);

      expect(actualState).toEqual(expectedState);
    });
  });

  describe('ACCOUNT_SWITCH', () => {
    test('resets state to initial state', () => {
      const initialState = deepFreeze([['stream', 'some_topic']]);

      const action = eg.action.account_switch;

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
        id: -1,
        muted_topics: [['stream', 'topic']],
      });

      const expectedState = [['stream', 'topic']];

      const newState = muteReducer(initialState, action);

      expect(newState).toEqual(expectedState);
      expect(newState).not.toBe(initialState);
    });
  });
});
