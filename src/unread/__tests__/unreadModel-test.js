/* @flow strict-local */
import Immutable from 'immutable';

import { EVENT_UPDATE_MESSAGE_FLAGS } from '../../actionConstants';
import { reducer, setUnion } from '../unreadModel';
import { type UnreadState } from '../unreadModelTypes';
import * as eg from '../../__tests__/lib/exampleData';
import { initialState, makeUnreadState } from './unread-testlib';

describe('setUnion', () => {
  for (const [desc, xs, ys] of ([
    ['empty', [], []],
    ['nonempty, empty', [1, 2], []],
    ['empty, nonempty', [], [1, 2]],
    ['in order', [1, 2], [3, 4]],
    ['reversed', [3, 4], [1, 2]],
    ['interleaved', [1, 3], [2, 4]],
    ['all dupes', [1, 2], [1, 2]],
    ['some dupes', [1, 2], [2, 3]],
    ['comparison is numeric, not lexicographic', [11], [2]],
  ]: [string, number[], number[]][])) {
    test(desc, () => {
      const expected = [...new Set([...xs, ...ys])].sort((a, b) => a - b);
      expect(setUnion(Immutable.List(xs), Immutable.List(ys)).toArray()).toEqual(expected);
    });
  }
});

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

  describe('RESET_ACCOUNT_DATA', () => {
    test('resets state to initial state', () => {
      const state = makeUnreadState(eg.plusReduxState, [eg.streamMessage()]);
      expect(state).not.toEqual(initialState);

      expect(reducer(state, eg.action.reset_account_data, eg.plusReduxState)).toEqual(initialState);
    });
  });

  describe('REGISTER_COMPLETE', () => {
    test('received data from "unread_msgs.streams" key replaces the current state ', () => {
      const message1 = eg.streamMessage({ id: 1 });

      const action = eg.mkActionRegisterComplete({
        unread_msgs: {
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
      });

      // prettier-ignore
      expect(summary(reducer(initialState, action, eg.plusReduxState))).toEqual(Immutable.Map([
        [message1.stream_id, Immutable.Map([[message1.subject, [1, 2]]])],
      ]));
    });
  });

  describe('EVENT_UPDATE_MESSAGE', () => {
    const mkAction = args => {
      const { message_ids, ...restArgs } = args;
      return eg.mkActionEventUpdateMessage({
        user_id: eg.selfUser.user_id,
        message_id: message_ids[0],
        message_ids,
        edit_timestamp: 10000,
        ...restArgs,
      });
    };

    const baseState = makeUnreadState(eg.plusReduxState, [
      eg.streamMessage({ stream_id: 123, subject: 'foo', id: 1 }),
      eg.streamMessage({ stream_id: 123, subject: 'foo', id: 2 }),
      eg.streamMessage({ stream_id: 123, subject: 'foo', id: 3 }),
      eg.streamMessage({ stream_id: 123, subject: 'foo', id: 4 }),
      eg.streamMessage({ stream_id: 456, subject: 'zzz', id: 6 }),
      eg.streamMessage({ stream_id: 456, subject: 'zzz', id: 7 }),
      eg.streamMessage({ stream_id: 123, subject: 'foo', id: 15 }),
    ]);

    test('(base state, for comparison)', () => {
      // prettier-ignore
      expect(summary(baseState)).toEqual(Immutable.Map([
        [123, Immutable.Map([['foo', [1, 2, 3, 4, 15]]])],
        [456, Immutable.Map([['zzz', [6, 7]]])],
      ]));
    });

    test('if topic/stream not updated, return original state', () => {
      const action = mkAction({ message_ids: [5], subject: 'foo' });
      const state = reducer(baseState, action, eg.plusReduxState);
      expect(state.streams).toBe(baseState.streams);
    });

    test('if topic updated, but no unreads, return original state', () => {
      const action = mkAction({
        message_ids: [100],
        stream_id: 123,
        orig_subject: 'foo',
        subject: 'bar',
      });
      const state = reducer(baseState, action, eg.plusReduxState);
      expect(state.streams).toBe(baseState.streams);
    });

    test('if topic updated, move unreads', () => {
      const action = mkAction({
        message_ids: [3, 4, 15],
        stream_id: 123,
        orig_subject: 'foo',
        subject: 'bar',
      });
      const state = reducer(baseState, action, eg.plusReduxState);
      // prettier-ignore
      expect(summary(state)).toEqual(Immutable.Map([
        [123, Immutable.Map([['foo', [1, 2]], ['bar', [3, 4, 15]]])],
        [456, Immutable.Map([['zzz', [6, 7]]])],
      ]));
    });

    test('if stream updated, move unreads', () => {
      const action = mkAction({
        message_ids: [3, 4, 15],
        stream_id: 123,
        new_stream_id: 456,
        orig_subject: 'foo',
      });
      const state = reducer(baseState, action, eg.plusReduxState);
      // prettier-ignore
      expect(summary(state)).toEqual(Immutable.Map([
        [123, Immutable.Map([['foo', [1, 2]]])],
        [456, Immutable.Map([['zzz', [6, 7]], ['foo', [3, 4, 15]]])],
      ]));
    });

    test('if none left at old topic, prune', () => {
      const action = mkAction({
        message_ids: [1, 2, 3, 4, 15],
        stream_id: 123,
        new_stream_id: 456,
        orig_subject: 'foo',
      });
      const state = reducer(baseState, action, eg.plusReduxState);
      // prettier-ignore
      expect(summary(state)).toEqual(Immutable.Map([
        [456, Immutable.Map([['zzz', [6, 7]], ['foo', [1, 2, 3, 4, 15]]])],
      ]));
    });

    test('if moved to topic with existing unreads, ids stay sorted', () => {
      const action = mkAction({
        message_ids: [3, 4, 15],
        stream_id: 123,
        new_stream_id: 456,
        orig_subject: 'foo',
        subject: 'zzz',
      });
      const state = reducer(baseState, action, eg.plusReduxState);
      // prettier-ignore
      expect(summary(state)).toEqual(Immutable.Map([
        [123, Immutable.Map([['foo', [1, 2]]])],
        [456, Immutable.Map([['zzz', [3, 4, 6, 7, 15]]])],
      ]));
    });
  });

  describe('EVENT_NEW_MESSAGE', () => {
    const action = eg.mkActionEventNewMessage;

    const baseState = makeUnreadState(eg.plusReduxState, [
      eg.streamMessage({ id: 1, subject: 'some topic' }),
    ]);

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

    test('if message has "read" flag, do not mutate state', () => {
      const state = reducer(
        baseState,
        action(eg.streamMessage({ sender: eg.selfUser, flags: ['read'] })),
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
      const {
        all = false,
        messages,
        message_details = new Map(),
        flag = 'read',
        op = 'add',
      } = args;
      return {
        id: 1,
        type: EVENT_UPDATE_MESSAGE_FLAGS,
        allMessages: eg.makeMessagesState([]),
        all,
        messages,
        message_details,
        flag,
        op,
      };
    };

    const streamAction = args => eg.mkActionEventNewMessage(eg.streamMessage(args));

    const baseState = makeUnreadState(eg.plusReduxState, [
      eg.streamMessage({ stream_id: 123, subject: 'foo', id: 1 }),
      eg.streamMessage({ stream_id: 123, subject: 'foo', id: 2 }),
      eg.streamMessage({ stream_id: 123, subject: 'foo', id: 3 }),
      eg.streamMessage({ stream_id: 234, subject: 'bar', id: 4 }),
      eg.streamMessage({ stream_id: 234, subject: 'bar', id: 5 }),
    ]);

    const messageDetailsEntry = (stream_id, topic) => ({
      type: 'stream',
      stream_id,
      topic,
    });

    test('(base state, for comparison)', () => {
      // prettier-ignore
      expect(summary(baseState)).toEqual(Immutable.Map([
        [123, Immutable.Map([['foo', [1, 2, 3]]])],
        [234, Immutable.Map([['bar', [4, 5]]])],
      ]));
    });

    test('when operation is "add" but flag is not "read" do not mutate state', () => {
      const action = mkAction({ messages: [1, 2, 3], flag: 'starred' });
      expect(reducer(initialState, action, eg.plusReduxState)).toBe(initialState);
    });

    test('if id does not exist do not mutate state', () => {
      const action = mkAction({ messages: [6, 7] });
      expect(reducer(baseState, action, eg.plusReduxState)).toBe(baseState);
    });

    test('if ids are in state remove them', () => {
      const action = mkAction({ messages: [3, 4, 5, 6] });
      // prettier-ignore
      expect(summary(reducer(baseState, action, eg.plusReduxState))).toEqual(Immutable.Map([
        [123, Immutable.Map([['foo', [1, 2]]])],
      ]));
    });

    test("when removing, don't touch unaffected topics or streams", () => {
      const state = reducer(
        baseState,
        streamAction({ stream_id: 123, subject: 'qux', id: 7 }),
        eg.plusReduxState,
      );
      // prettier-ignore
      expect(summary(state)).toEqual(Immutable.Map([
        [123, Immutable.Map([['foo', [1, 2, 3]], ['qux', [7]]])],
        [234, Immutable.Map([['bar', [4, 5]]])],
      ]));

      const action = mkAction({ messages: [1, 2] });
      const newState = reducer(state, action, eg.plusReduxState);
      // prettier-ignore
      expect(summary(newState)).toEqual(Immutable.Map([
        [123, Immutable.Map([['foo', [3]], ['qux', [7]]])],
        [234, Immutable.Map([['bar', [4, 5]]])],
      ]));
      expect(newState.streams.get(123)?.get('qux')).toBe(state.streams.get(123)?.get('qux'));
      expect(newState.streams.get(234)).toBe(state.streams.get(234));
    });

    test('when operation is "remove", add stream messages to unreads', () => {
      const state = reducer(
        baseState,
        streamAction({ stream_id: 234, subject: 'bar', id: 100 }),
        eg.plusReduxState,
      );
      // prettier-ignore
      expect(summary(state)).toEqual(Immutable.Map([
        [123, Immutable.Map([['foo', [1, 2, 3]]])],
        [234, Immutable.Map([['bar', [4, 5, 100]]])],
      ]));

      const action = mkAction({
        messages: [6, 42, 99, 7, 8],
        op: 'remove',
        message_details: new Map([
          [99, messageDetailsEntry(123, 'foo')],
          [6, messageDetailsEntry(234, 'bar')],
          [8, messageDetailsEntry(234, 'bar')],
          [42, messageDetailsEntry(123, 'foo')],
          [7, messageDetailsEntry(234, 'baz')],
        ]),
      });
      const newState = reducer(state, action, eg.plusReduxState);
      expect(summary(newState)).toEqual(
        Immutable.Map([
          [123, Immutable.Map([['foo', [1, 2, 3, 42, 99]]])],
          [
            234,
            Immutable.Map([
              ['bar', [4, 5, 6, 8, 100]],
              ['baz', [7]],
            ]),
          ],
        ]),
      );
    });

    test('on "remove", drop any duplicates', () => {
      const action = mkAction({
        messages: [2, 6],
        op: 'remove',
        message_details: new Map([
          [2, messageDetailsEntry(123, 'foo')],
          [6, messageDetailsEntry(123, 'foo')],
        ]),
      });
      const newState = reducer(baseState, action, eg.plusReduxState);
      expect(summary(newState)).toEqual(
        Immutable.Map([
          [123, Immutable.Map([['foo', [1, 2, 3, 6]]])],
          [234, Immutable.Map([['bar', [4, 5]]])],
        ]),
      );
    });

    test('when "all" is true reset state', () => {
      const action = mkAction({ messages: [], all: true });
      expect(reducer(baseState, action, eg.plusReduxState).streams).toBe(initialState.streams);
    });
  });
});
