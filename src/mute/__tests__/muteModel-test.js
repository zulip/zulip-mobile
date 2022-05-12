/* @flow strict-local */
import deepFreeze from 'deep-freeze';

import fullReducer from '../../boot/reducers';
import { getMute, getTopicVisibilityPolicy, isTopicMuted, reducer } from '../muteModel';
import { EVENT_MUTED_TOPICS } from '../../actionConstants';
import * as eg from '../../__tests__/lib/exampleData';
import { makeMuteState } from './mute-testlib';
import { tryGetActiveAccountState } from '../../selectors';
import { UserTopicVisibilityPolicy } from '../../api/modelTypes';

/* eslint jest/expect-expect: ["error", { "assertFunctionNames": ["expect", "check"] }] */

const initialState = makeMuteState([]);

describe('getters', () => {
  describe('getTopicVisibilityPolicy', () => {
    function check(state, expected) {
      expect(getTopicVisibilityPolicy(state, eg.stream.stream_id, 'topic')).toEqual(expected);
    }

    test('with nothing for stream', () => {
      check(makeMuteState([]), UserTopicVisibilityPolicy.None);
    });

    test('with nothing for topic', () => {
      check(makeMuteState([[eg.stream, 'other topic']]), UserTopicVisibilityPolicy.None);
    });

    test('with topic muted', () => {
      check(makeMuteState([[eg.stream, 'topic']]), UserTopicVisibilityPolicy.Muted);
    });
  });

  describe('isTopicMuted', () => {
    function check(state, expected) {
      expect(isTopicMuted(eg.stream.stream_id, 'topic', state)).toEqual(expected);
    }

    test('with nothing for stream', () => {
      check(makeMuteState([]), false);
    });

    test('with nothing for topic', () => {
      check(makeMuteState([[eg.stream, 'other topic']]), false);
    });

    test('with topic muted', () => {
      check(makeMuteState([[eg.stream, 'topic']]), true);
    });
  });
});

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
      const newState = tryGetActiveAccountState(fullReducer(eg.plusReduxState, action));
      expect(newState).toBeTruthy();
      expect(newState && getMute(newState)).toEqual(makeMuteState([[eg.stream, 'topic']]));
    });

    // TODO(#5102): Delete; see comment on implementation.
    test('when no `mute` data is given reset state', () => {
      const state = makeMuteState([[eg.stream, 'topic']]);
      const action = eg.mkActionRegisterComplete({ muted_topics: [] });
      expect(reducer(state, action, eg.plusReduxState)).toEqual(initialState);
    });
  });

  describe('RESET_ACCOUNT_DATA', () => {
    test('resets state to initial state', () => {
      const state = makeMuteState([[eg.stream, 'some_topic']]);
      expect(reducer(state, eg.action.reset_account_data, eg.plusReduxState)).toEqual(initialState);
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
