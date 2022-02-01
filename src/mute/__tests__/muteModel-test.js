/* @flow strict-local */
import deepFreeze from 'deep-freeze';

import fullReducer from '../../boot/reducers';
import { getMute, reducer } from '../muteModel';
import { EVENT_MUTED_TOPICS } from '../../actionConstants';
import * as eg from '../../__tests__/lib/exampleData';
import { makeMuteState } from './mute-testlib';
import { tryGetActiveAccountState } from '../../selectors';

const initialState = makeMuteState([]);

describe('reducer', () => {
  describe('REGISTER_COMPLETE', () => {
    test('when mute data is provided init state with it: local', () => {
      const action = eg.mkActionRegisterComplete({ muted_topics: [[eg.stream.name, 'topic']] });
      expect(reducer(initialState, action, eg.plusReduxState)).toEqual(
        makeMuteState([[eg.stream, 'topic']]),
      );
    });

    test('when mute data is provided init state with it: end-to-end', () => {
      const action = eg.mkActionRegisterComplete({
        streams: [eg.stream],
        subscriptions: [eg.subscription],
        muted_topics: [[eg.stream.name, 'topic']],
      });
      const newState = tryGetActiveAccountState(fullReducer(eg.baseReduxState, action));
      expect(newState).toBeTruthy();
      expect(newState && getMute(newState)).toEqual(makeMuteState([[eg.stream, 'topic']]));
    });

    test('when no `mute` data is given reset state', () => {
      const state = makeMuteState([[eg.stream, 'topic']]);
      const action = eg.mkActionRegisterComplete({ muted_topics: [] });
      expect(reducer(state, action, eg.plusReduxState)).toEqual(initialState);
    });
  });

  describe('ACCOUNT_SWITCH', () => {
    test('resets state to initial state', () => {
      const state = makeMuteState([[eg.stream, 'some_topic']]);
      expect(reducer(state, eg.action.account_switch, eg.plusReduxState)).toEqual(initialState);
    });
  });

  describe('EVENT_MUTED_TOPICS', () => {
    test('appends and test a new muted topic', () => {
      const action = deepFreeze({
        type: EVENT_MUTED_TOPICS,
        id: -1,
        muted_topics: [[eg.stream.name, 'topic']],
      });
      expect(reducer(initialState, action, eg.plusReduxState)).toEqual(
        makeMuteState([[eg.stream, 'topic']]),
      );
    });
  });
});
