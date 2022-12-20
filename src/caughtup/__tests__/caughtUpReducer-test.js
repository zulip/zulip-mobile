/* @flow strict-local */
import deepFreeze from 'deep-freeze';

import * as eg from '../../__tests__/lib/exampleData';
import caughtUpReducer from '../caughtUpReducer';
import { MESSAGE_FETCH_ERROR } from '../../actionConstants';
import {
  HOME_NARROW,
  HOME_NARROW_STR,
  keyFromNarrow,
  SEARCH_NARROW,
  streamNarrow,
  topicNarrow,
  pm1to1NarrowFromUser,
} from '../../utils/narrow';
import { objectFromEntries } from '../../jsBackport';

describe('caughtUpReducer', () => {
  describe('RESET_ACCOUNT_DATA', () => {
    const initialState = eg.baseReduxState.caughtUp;
    const action1 = { ...eg.action.message_fetch_complete, foundNewest: true, foundOldest: true };
    const prevState = caughtUpReducer(initialState, action1);
    expect(prevState).not.toEqual(initialState);

    expect(caughtUpReducer(prevState, eg.action.reset_account_data)).toEqual(initialState);
  });

  describe('REGISTER_COMPLETE', () => {
    const initialState = eg.baseReduxState.caughtUp;
    const prevState = caughtUpReducer(initialState, {
      ...eg.action.message_fetch_complete,
      foundNewest: true,
      foundOldest: true,
    });
    expect(prevState).not.toEqual(initialState);

    expect(caughtUpReducer(prevState, eg.action.register_complete)).toEqual(initialState);
  });

  describe('MESSAGE_FETCH_START', () => {
    test('when fetch starts caught up does not change', () => {
      const prevState = deepFreeze({ [HOME_NARROW_STR]: { older: true, newer: true } });
      expect(
        caughtUpReducer(
          prevState,
          deepFreeze({ ...eg.action.message_fetch_start, narrow: HOME_NARROW }),
        ),
      ).toBe(prevState);
    });

    test('if fetching for a search narrow, ignore', () => {
      const prevState = deepFreeze({ [HOME_NARROW_STR]: { older: false, newer: false } });
      expect(
        caughtUpReducer(
          prevState,
          deepFreeze({ ...eg.action.message_fetch_start, narrow: SEARCH_NARROW('some query') }),
        ),
      ).toEqual(prevState);
    });
  });

  describe('MESSAGE_FETCH_ERROR', () => {
    test('reverses the effect of MESSAGE_FETCH_START as much as possible', () => {
      // As of the addition of this test, it's fully possible:
      // MESSAGE_FETCH_START applies the identity function to the
      // state (i.e., it doesn't do anything to it). Reversing that
      // effect is also done with the identity function.

      const narrow1 = pm1to1NarrowFromUser(eg.otherUser);
      const narrow2 = pm1to1NarrowFromUser(eg.thirdUser);

      // Include some other narrow to test that the reducer doesn't go mess
      // something up there.
      const initialState = deepFreeze({ [keyFromNarrow(narrow1)]: { older: true, newer: true } });
      expect(
        [
          deepFreeze({ ...eg.action.message_fetch_start, narrow: narrow2 }),
          deepFreeze({ type: MESSAGE_FETCH_ERROR, narrow: narrow2, error: new Error() }),
        ].reduce(caughtUpReducer, initialState),
      ).toEqual(initialState);
    });
  });

  describe('MESSAGE_FETCH_COMPLETE', () => {
    test('apply `foundNewest` and `foundOldest` when true', () => {
      const prevState = deepFreeze({});
      expect(
        caughtUpReducer(
          prevState,
          deepFreeze({ ...eg.action.message_fetch_complete, foundNewest: true, foundOldest: true }),
        ),
      ).toEqual({ [HOME_NARROW_STR]: { older: true, newer: true } });
    });

    test('if fetched messages are from a search narrow, ignore them', () => {
      const prevState = deepFreeze({});
      expect(
        caughtUpReducer(
          prevState,
          deepFreeze({
            ...eg.action.message_fetch_complete,
            narrow: SEARCH_NARROW('some query'),
            foundOldest: true,
            foundNewest: true,
          }),
        ),
      ).toEqual(prevState);
    });
  });

  test('new false results do not reset previous true state', () => {
    const prevState = deepFreeze({ [HOME_NARROW_STR]: { older: true, newer: true } });
    expect(
      caughtUpReducer(
        prevState,
        deepFreeze({ ...eg.action.message_fetch_complete, foundOldest: false, foundNewest: false }),
      ),
    ).toEqual({ [HOME_NARROW_STR]: { older: true, newer: true } });
  });

  describe('EVENT_UPDATE_MESSAGE', () => {
    const mkAction = args => {
      const { messages, ...restArgs } = args;
      const message = messages[0];
      return eg.mkActionEventUpdateMessage({
        message_id: message.id,
        message_ids: messages.map(m => m.id),
        stream_id: message.stream_id,
        orig_subject: message.subject,
        ...restArgs,
      });
    };

    const mkKey = (stream, topic) =>
      topic !== undefined
        ? keyFromNarrow(topicNarrow(stream.stream_id, topic))
        : keyFromNarrow(streamNarrow(stream.stream_id));

    const topic1 = 'topic foo';
    const topic2 = 'topic bar';
    // const message1a = eg.streamMessage({ subject: topic1, id: 1 });
    const message1b = eg.streamMessage({ subject: topic1, id: 2 });
    // const message1c = eg.streamMessage({ subject: topic1, id: 3 });
    // const message2a = eg.streamMessage({ subject: topic2, id: 4 });

    test('new topic, same stream', () => {
      expect(
        caughtUpReducer(
          objectFromEntries([
            [mkKey(eg.stream, topic1), { older: true, newer: true }],
            [mkKey(eg.stream, topic2), { older: true, newer: true }],
            [mkKey(eg.stream), { older: true, newer: true }],
          ]),
          mkAction({ messages: [message1b], subject: topic2 }),
        ),
      ).toEqual(
        objectFromEntries([
          // old topic narrow remains caught up:
          [mkKey(eg.stream, topic1), { older: true, newer: true }],
          // new topic narrow gets cleared
          // stream narrow unchanged:
          [mkKey(eg.stream), { older: true, newer: true }],
        ]),
      );
    });

    test('same topic, new stream', () => {
      expect(
        caughtUpReducer(
          objectFromEntries([
            [mkKey(eg.stream, topic1), { older: true, newer: true }],
            [mkKey(eg.stream), { older: true, newer: true }],
            [mkKey(eg.otherStream, topic1), { older: true, newer: true }],
            [mkKey(eg.otherStream), { older: true, newer: true }],
          ]),
          mkAction({ messages: [message1b], new_stream_id: eg.otherStream.stream_id }),
        ),
      ).toEqual(
        objectFromEntries([
          // old topic and stream narrows remain caught up:
          [mkKey(eg.stream, topic1), { older: true, newer: true }],
          [mkKey(eg.stream), { older: true, newer: true }],
          // new topic and stream narrows both cleared
        ]),
      );
    });

    // Try to keep these tests corresponding closely to those for the
    // narrows reducer.  (In the future these should really be a single
    // sub-reducer.)
  });
});
