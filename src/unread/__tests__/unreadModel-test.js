/* @flow strict-local */
import Immutable from 'immutable';

import { ACCOUNT_SWITCH, EVENT_UPDATE_MESSAGE_FLAGS } from '../../actionConstants';
import { reducer } from '../unreadModel';
import { type UnreadState } from '../unreadModelTypes';
import * as eg from '../../__tests__/lib/exampleData';
import { initialState, mkMessageAction } from './unread-testlib';

// These are the tests corresponding to unreadStreamsReducer-test.js.
// Ultimately we'll want to flip this way of organizing the tests, and
// test the whole model together rather than streams/mentions/etc.;
// but this way simplifies the conversion from the old tests.
describe('stream substate', () => {
  // Summarize the state, for convenient comparison to expectations.
  // Specifically just turn the inner `Immutable.List`s into arrays,
  // to shorten writing the expected data.
  const summary = (state: UnreadState) =>
    state.streams.map(perStream => perStream.map(perTopic => perTopic.toArray()));

  describe('ACCOUNT_SWITCH', () => {
    test('resets state to initial state', () => {
      const state = reducer(initialState, mkMessageAction(eg.streamMessage()), eg.plusReduxState);
      expect(state).not.toEqual(initialState);

      const action = { type: ACCOUNT_SWITCH, index: 1 };
      expect(reducer(state, action, eg.plusReduxState)).toEqual(initialState);
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
      expect(summary(reducer(initialState, action, eg.plusReduxState))).toEqual(Immutable.Map([
        [message1.stream_id, Immutable.Map([[message1.subject, [1, 2]]])],
      ]));
    });
  });

  describe('EVENT_NEW_MESSAGE', () => {
    const action = mkMessageAction;

    const baseState = (() => {
      let state = initialState;
      state = reducer(
        state,
        action(eg.streamMessage({ id: 1, subject: 'some topic' })),
        eg.plusReduxState,
      );
      return state;
    })();

    test('(base state, for comparison)', () => {
      // prettier-ignore
      expect(summary(baseState)).toEqual(Immutable.Map([
        [eg.stream.stream_id, Immutable.Map([['some topic', [1]]])],
      ]));
    });

    test('if message is not stream, return original state', () => {
      const state = reducer(baseState, action(eg.pmMessage({ id: 4 })), eg.plusReduxState);
      expect(state.streams).toBe(baseState.streams);
    });

    test('if message is sent by self, do not mutate state', () => {
      const state = reducer(
        baseState,
        action(eg.streamMessage({ sender: eg.selfUser })),
        eg.plusReduxState,
      );
      expect(state).toBe(baseState);
    });

    test('if message id does not exist, append to state', () => {
      const state = reducer(
        baseState,
        action(eg.streamMessage({ id: 4, subject: 'some topic' })),
        eg.plusReduxState,
      );
      // prettier-ignore
      expect(summary(state)).toEqual(Immutable.Map([
        [eg.stream.stream_id, Immutable.Map([['some topic', [1, 4]]])],
      ]));
    });

    test('known stream, new topic', () => {
      const message = eg.streamMessage({ id: 4, subject: 'another topic' });
      const state = reducer(baseState, action(message), eg.plusReduxState);
      // prettier-ignore
      expect(summary(state)).toEqual(Immutable.Map([
        [eg.stream.stream_id, Immutable.Map([
          ['some topic', [1]],
          ['another topic', [4]],
        ])],
      ]));
    });

    test('if stream with topic does not exist, append to state', () => {
      const otherStream = eg.makeStream();
      const state = reducer(
        baseState,
        action(eg.streamMessage({ id: 4, stream: otherStream, subject: 'another topic' })),
        eg.plusReduxState,
      );
      // prettier-ignore
      expect(summary(state)).toEqual(Immutable.Map([
        [eg.stream.stream_id, Immutable.Map([['some topic', [1]]])],
        [otherStream.stream_id, Immutable.Map([['another topic', [4]]])],
      ]));
    });
  });

  describe('EVENT_UPDATE_MESSAGE_FLAGS', () => {
    const mkAction = args => {
      const { all = false, messages, flag = 'read', op = 'add' } = args;
      return {
        id: 1,
        type: EVENT_UPDATE_MESSAGE_FLAGS,
        allMessages: eg.makeMessagesState([]),
        all,
        messages,
        flag,
        op,
      };
    };

    const messages = [
      eg.streamMessage({ stream_id: 123, subject: 'foo', id: 1 }),
      eg.streamMessage({ stream_id: 123, subject: 'foo', id: 2 }),
      eg.streamMessage({ stream_id: 123, subject: 'foo', id: 3 }),
      eg.streamMessage({ stream_id: 234, subject: 'bar', id: 4 }),
      eg.streamMessage({ stream_id: 234, subject: 'bar', id: 5 }),
    ];

    const baseState = (() => {
      const r = (state, action) => reducer(state, action, eg.plusReduxState);
      let state = initialState;
      for (const message of messages) {
        state = r(state, mkMessageAction(message));
      }
      return state;
    })();

    const baseGlobalState = eg.reduxStatePlus({
      messages: eg.makeMessagesState(messages),
      unread: baseState,
    });

    test('(base state, for comparison)', () => {
      // prettier-ignore
      expect(summary(baseState)).toEqual(Immutable.Map([
        [123, Immutable.Map([['foo', [1, 2, 3]]])],
        [234, Immutable.Map([['bar', [4, 5]]])],
      ]));
    });

    test('when operation is "add" but flag is not "read" do not mutate state', () => {
      const action = mkAction({ messages: [1, 2, 3], flag: 'star' });
      expect(reducer(initialState, action, baseGlobalState)).toBe(initialState);
    });

    test('if id does not exist do not mutate state', () => {
      const action = mkAction({ messages: [6, 7] });
      expect(reducer(baseState, action, baseGlobalState)).toBe(baseState);
    });

    test('if ids are in state remove them', () => {
      const action = mkAction({ messages: [3, 4, 5, 6] });
      // prettier-ignore
      expect(summary(reducer(baseState, action, baseGlobalState))).toEqual(Immutable.Map([
        [123, Immutable.Map([['foo', [1, 2]]])],
      ]));
    });

    test("when removing, don't touch unaffected topics or streams", () => {
      const message = eg.streamMessage({ stream_id: 123, subject: 'qux', id: 7 });
      const state = reducer(baseState, mkMessageAction(message), baseGlobalState);
      const globalState = eg.reduxStatePlus({
        messages: eg.makeMessagesState([...messages, message]),
        unread: state,
      });

      // prettier-ignore
      expect(summary(state)).toEqual(Immutable.Map([
        [123, Immutable.Map([['foo', [1, 2, 3]], ['qux', [7]]])],
        [234, Immutable.Map([['bar', [4, 5]]])],
      ]));

      const action = mkAction({ messages: [1, 2] });
      const newState = reducer(state, action, globalState);
      // prettier-ignore
      expect(summary(newState)).toEqual(Immutable.Map([
        [123, Immutable.Map([['foo', [3]], ['qux', [7]]])],
        [234, Immutable.Map([['bar', [4, 5]]])],
      ]));
      expect(newState.streams.get(123)?.get('qux')).toBe(state.streams.get(123)?.get('qux'));
      expect(newState.streams.get(234)).toBe(state.streams.get(234));
    });

    test('when operation is "remove" do nothing', () => {
      const action = mkAction({ messages: [1, 2], op: 'remove' });
      expect(reducer(baseState, action, baseGlobalState)).toBe(baseState);
    });

    test('when "all" is true reset state', () => {
      const action = mkAction({ messages: [], all: true });
      expect(reducer(baseState, action, baseGlobalState).streams).toBe(initialState.streams);
    });
  });
});
