/* @flow strict-local */
import Immutable from 'immutable';

import { ACCOUNT_SWITCH, EVENT_UPDATE_MESSAGE_FLAGS } from '../../actionConstants';
import { reducer } from '../unreadModel';
import * as eg from '../../__tests__/lib/exampleData';
import { initialState, mkMessageAction } from './unread-testlib';

// These are the tests corresponding to unreadStreamsReducer-test.js.
// Ultimately we'll want to flip this way of organizing the tests, and
// test the whole model together rather than streams/mentions/etc.;
// but this way simplifies the conversion from the old tests.
describe('stream substate', () => {
  // Summarize the state, for convenient comparison to expectations.
  // In particular, abstract away irrelevant details of the ordering of
  // streams and topics in the data structure -- those should never matter
  // to selectors, and in a better data structure they wouldn't exist in the
  // first place.
  const summary = state => {
    // prettier-ignore
    const result: Immutable.Map<number, Immutable.Map<string, number[]>> =
      Immutable.Map().asMutable();
    for (const { stream_id, topic, unread_message_ids } of state.streams) {
      result.setIn([stream_id, topic], unread_message_ids);
    }
    return result.asImmutable();
  };

  describe('ACCOUNT_SWITCH', () => {
    test('resets state to initial state', () => {
      const state = reducer(initialState, mkMessageAction(eg.streamMessage()));
      expect(state).not.toEqual(initialState);

      const action = { type: ACCOUNT_SWITCH, index: 1 };
      expect(reducer(state, action)).toEqual(initialState);
    });
  });

  describe('REALM_INIT', () => {
    test('received data from "unread_msgs.streams" key replaces the current state ', () => {
      const message1 = eg.streamMessage({ id: 1 });

      const action = {
        ...eg.action.realm_init,
        data: {
          ...eg.action.realm_init.data,
          unread_msgs: {
            ...eg.action.realm_init.data.unread_msgs,
            streams: [
              {
                stream_id: message1.stream_id,
                topic: message1.subject,
                unread_message_ids: [message1.id, 2],
              },
            ],
            huddles: [],
            pms: [],
            mentions: [message1.id, 2, 3],
          },
        },
      };

      // prettier-ignore
      expect(summary(reducer(initialState, action))).toEqual(Immutable.Map([
        [message1.stream_id, Immutable.Map([[message1.subject, [1, 2]]])],
      ]));
    });
  });

  describe('EVENT_NEW_MESSAGE', () => {
    const action = mkMessageAction;

    const baseState = (() => {
      let state = initialState;
      state = reducer(state, action(eg.streamMessage({ id: 1, subject: 'some topic' })));
      return state;
    })();

    test('(base state, for comparison)', () => {
      // prettier-ignore
      expect(summary(baseState)).toEqual(Immutable.Map([
        [eg.stream.stream_id, Immutable.Map([['some topic', [1]]])],
      ]));
    });

    test('if message id already exists, do not mutate state', () => {
      const state = reducer(baseState, action(eg.streamMessage({ id: 1, subject: 'some topic' })));
      expect(state).toBe(baseState);
    });

    test('if message is not stream, return original state', () => {
      const state = reducer(baseState, action(eg.pmMessage({ id: 4 })));
      expect(state.streams).toBe(baseState.streams);
    });

    test('if message is sent by self, do not mutate state', () => {
      const state = reducer(baseState, action(eg.streamMessage({ sender: eg.selfUser })));
      expect(state).toBe(baseState);
    });

    test('if message id does not exist, append to state', () => {
      const state = reducer(baseState, action(eg.streamMessage({ id: 4, subject: 'some topic' })));
      // prettier-ignore
      expect(summary(state)).toEqual(Immutable.Map([
        [eg.stream.stream_id, Immutable.Map([['some topic', [1, 4]]])],
      ]));
    });

    test('known stream, new topic', () => {
      const message = eg.streamMessage({ id: 4, subject: 'another topic' });
      const state = reducer(baseState, action(message));
      // prettier-ignore
      expect(summary(state)).toEqual(Immutable.Map([
        [eg.stream.stream_id, Immutable.Map([
          ['some topic', [1]],
          ['another topic', [4]],
        ])],
      ]));
    });

    test('if stream with topic does not exist, append to state', () => {
      const message = eg.streamMessage({ id: 4, stream_id: 2, subject: 'another topic' });
      const state = reducer(baseState, action(message));
      // prettier-ignore
      expect(summary(state)).toEqual(Immutable.Map([
        [eg.stream.stream_id, Immutable.Map([['some topic', [1]]])],
        [message.stream_id, Immutable.Map([['another topic', [4]]])],
      ]));
    });
  });

  describe('EVENT_UPDATE_MESSAGE_FLAGS', () => {
    const mkAction = args => {
      const { all = false, messages, flag = 'read', operation = 'add' } = args;
      return {
        id: 1,
        type: EVENT_UPDATE_MESSAGE_FLAGS,
        allMessages: eg.makeMessagesState([]),
        all,
        messages,
        flag,
        operation,
      };
    };

    const baseState = (() => {
      const streamAction = args => mkMessageAction(eg.streamMessage(args));
      let state = initialState;
      state = reducer(state, streamAction({ stream_id: 123, subject: 'foo', id: 1 }));
      state = reducer(state, streamAction({ stream_id: 123, subject: 'foo', id: 2 }));
      state = reducer(state, streamAction({ stream_id: 123, subject: 'foo', id: 3 }));
      state = reducer(state, streamAction({ stream_id: 234, subject: 'bar', id: 4 }));
      state = reducer(state, streamAction({ stream_id: 234, subject: 'bar', id: 5 }));
      return state;
    })();

    test('(base state, for comparison)', () => {
      // prettier-ignore
      expect(summary(baseState)).toEqual(Immutable.Map([
        [123, Immutable.Map([['foo', [1, 2, 3]]])],
        [234, Immutable.Map([['bar', [4, 5]]])],
      ]));
    });

    test('when operation is "add" but flag is not "read" do not mutate state', () => {
      const action = mkAction({ messages: [1, 2, 3], flag: 'star' });
      expect(reducer(initialState, action)).toBe(initialState);
    });

    test('if id does not exist do not mutate state', () => {
      const action = mkAction({ messages: [6, 7] });
      expect(reducer(baseState, action)).toBe(baseState);
    });

    test('if ids are in state remove them', () => {
      const action = mkAction({ messages: [3, 4, 5, 6] });
      // prettier-ignore
      expect(summary(reducer(baseState, action))).toEqual(Immutable.Map([
        [123, Immutable.Map([['foo', [1, 2]]])],
      ]));
    });

    test('when operation is "remove" do nothing', () => {
      const action = mkAction({ messages: [1, 2], operation: 'remove' });
      expect(reducer(baseState, action)).toBe(baseState);
    });

    test('when "all" is true reset state', () => {
      const action = mkAction({ messages: [], all: true });
      expect(reducer(baseState, action).streams).toBe(initialState.streams);
    });
  });
});
