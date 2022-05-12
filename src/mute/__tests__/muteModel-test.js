/* @flow strict-local */
import deepFreeze from 'deep-freeze';

import fullReducer from '../../boot/reducers';
import { getMute, getTopicVisibilityPolicy, isTopicMuted, reducer } from '../muteModel';
import { EVENT, EVENT_MUTED_TOPICS } from '../../actionConstants';
import * as eg from '../../__tests__/lib/exampleData';
import { makeMuteState, makeUserTopic } from './mute-testlib';
import { tryGetActiveAccountState } from '../../selectors';
import { UserTopicVisibilityPolicy } from '../../api/modelTypes';
import { EventTypes } from '../../api/eventTypes';

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
    test('in modern user_topics format: unit test', () => {
      const action = eg.mkActionRegisterComplete({
        user_topics: [makeUserTopic(eg.stream, 'topic', UserTopicVisibilityPolicy.Muted)],
      });
      expect(reducer(initialState, action, eg.plusReduxState)).toEqual(
        makeMuteState([[eg.stream, 'topic']]),
      );
    });

    test('in modern user_topics format: end-to-end test', () => {
      const action = eg.mkActionRegisterComplete({
        streams: [eg.stream],
        subscriptions: [eg.subscription],
        user_topics: [makeUserTopic(eg.stream, 'topic', UserTopicVisibilityPolicy.Muted)],
      });
      const newState = tryGetActiveAccountState(fullReducer(eg.plusReduxState, action));
      expect(newState).toBeTruthy();
      expect(newState && getMute(newState)).toEqual(makeMuteState([[eg.stream, 'topic']]));
    });

    test('in old muted_topics format: unit test', () => {
      const action = eg.mkActionRegisterComplete({
        muted_topics: [[eg.stream.name, 'topic']],
        user_topics: undefined,
      });
      expect(reducer(initialState, action, eg.plusReduxState)).toEqual(
        makeMuteState([[eg.stream, 'topic']]),
      );
    });

    test('in old muted_topics format: end-to-end test', () => {
      const action = eg.mkActionRegisterComplete({
        streams: [eg.stream],
        subscriptions: [eg.subscription],
        muted_topics: [[eg.stream.name, 'topic']],
        user_topics: undefined,
      });
      const newState = tryGetActiveAccountState(fullReducer(eg.plusReduxState, action));
      expect(newState).toBeTruthy();
      expect(newState && getMute(newState)).toEqual(makeMuteState([[eg.stream, 'topic']]));
    });

    // TODO(#5102): Delete; see comment on implementation.
    test('in ancient no-muted-topics format', () => {
      const state = makeMuteState([[eg.stream, 'topic']]);
      const action = eg.mkActionRegisterComplete({
        muted_topics: undefined,
        user_topics: undefined,
      });
      expect(reducer(state, action, eg.plusReduxState)).toEqual(initialState);
    });
  });

  describe('RESET_ACCOUNT_DATA', () => {
    test('resets state to initial state', () => {
      const state = makeMuteState([[eg.stream, 'some_topic']]);
      expect(reducer(state, eg.action.reset_account_data, eg.plusReduxState)).toEqual(initialState);
    });
  });

  describe('EVENT > user_topic', () => {
    function mkAction(userTopic) {
      return { type: EVENT, event: { id: 0, type: EventTypes.user_topic, ...userTopic } };
    }

    function check(state, userTopic, expected) {
      expect(reducer(state, mkAction(userTopic), eg.plusReduxState)).toEqual(expected);
    }

    test('add with new stream', () => {
      check(
        initialState,
        makeUserTopic(eg.stream, 'topic', UserTopicVisibilityPolicy.Muted),
        makeMuteState([[eg.stream, 'topic']]),
      );
    });

    test('add in existing stream', () => {
      check(
        makeMuteState([[eg.stream, 'topic']]),
        makeUserTopic(eg.stream, 'other topic', UserTopicVisibilityPolicy.Muted),
        makeMuteState([
          [eg.stream, 'topic'],
          [eg.stream, 'other topic'],
        ]),
      );
    });

    test('remove, with others in stream', () => {
      check(
        makeMuteState([
          [eg.stream, 'topic'],
          [eg.stream, 'other topic'],
        ]),
        makeUserTopic(eg.stream, 'other topic', UserTopicVisibilityPolicy.None),
        makeMuteState([[eg.stream, 'topic']]),
      );
    });

    test('remove, as last in stream', () => {
      check(
        makeMuteState([[eg.stream, 'topic']]),
        makeUserTopic(eg.stream, 'topic', UserTopicVisibilityPolicy.None),
        initialState,
      );
    });

    describe('redundantly after EVENT_MUTED_TOPICS', () => {
      // The server may send both muted_topics events and user_topic events,
      // because we don't set event_types in our /register request:
      //   https://github.com/zulip/zulip/pull/21251#issuecomment-1133466148
      // So we may get one of these after a muted_topics event has already
      // set the new state.
      //
      // (Or we might get user_topic first and then muted_topics, but that
      // doesn't require any testing of its own -- when handling the
      // muted_topics event it doesn't matter what the previous state was.)

      test('add', () => {
        check(
          makeMuteState([[eg.stream, 'topic']]),
          makeUserTopic(eg.stream, 'topic', UserTopicVisibilityPolicy.Muted),
          makeMuteState([[eg.stream, 'topic']]),
        );
      });

      test('remove, leaving others in stream', () => {
        check(
          makeMuteState([[eg.stream, 'topic']]),
          makeUserTopic(eg.stream, 'other topic', UserTopicVisibilityPolicy.None),
          makeMuteState([[eg.stream, 'topic']]),
        );
      });

      test('remove, as last in stream', () => {
        check(
          makeMuteState([]),
          makeUserTopic(eg.stream, 'topic', UserTopicVisibilityPolicy.None),
          makeMuteState([]),
        );
      });
    });
  });

  describe('EVENT_MUTED_TOPICS (legacy)', () => {
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
