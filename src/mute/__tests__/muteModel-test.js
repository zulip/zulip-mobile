/* @flow strict-local */
import deepFreeze from 'deep-freeze';

import { reducer } from '../muteModel';
import { EVENT_MUTED_TOPICS } from '../../actionConstants';
import * as eg from '../../__tests__/lib/exampleData';

const initialState = deepFreeze([]);

describe('reducer', () => {
  describe('REGISTER_COMPLETE', () => {
    test('when `mute` data is provided init state with it', () => {
      const action = eg.mkActionRegisterComplete({ muted_topics: [['stream', 'topic']] });
      expect(reducer(initialState, action)).toEqual([['stream', 'topic']]);
    });

    test('when no `mute` data is given reset state', () => {
      const state = deepFreeze([['stream', 'topic']]);
      const action = eg.mkActionRegisterComplete({ muted_topics: [] });
      expect(reducer(state, action)).toEqual(initialState);
    });
  });

  describe('ACCOUNT_SWITCH', () => {
    test('resets state to initial state', () => {
      const state = deepFreeze([['stream', 'some_topic']]);
      expect(reducer(state, eg.action.account_switch)).toEqual(initialState);
    });
  });

  describe('EVENT_MUTED_TOPICS', () => {
    test('appends and test a new muted topic', () => {
      const action = deepFreeze({
        type: EVENT_MUTED_TOPICS,
        id: -1,
        muted_topics: [['stream', 'topic']],
      });
      expect(reducer(initialState, action)).toEqual([['stream', 'topic']]);
    });
  });
});
