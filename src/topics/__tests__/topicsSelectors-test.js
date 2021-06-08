/* @flow strict-local */
import Immutable from 'immutable';

import { getTopicsForNarrow, getLastMessageTopic, getTopicsForStream } from '../topicSelectors';
import { HOME_NARROW, streamNarrow, keyFromNarrow } from '../../utils/narrow';
import { reducer as unreadReducer } from '../../unread/unreadModel';
import * as eg from '../../__tests__/lib/exampleData';

describe('getTopicsForNarrow', () => {
  test('when no topics return an empty list', () => {
    const state = eg.reduxState();

    const topics = getTopicsForNarrow(state, HOME_NARROW);

    expect(topics).toEqual([]);
  });

  test('when there are topics in the active narrow, return them as string array', () => {
    const stream = { ...eg.makeStream({ name: 'hello' }), stream_id: 123 };
    const state = eg.reduxState({
      streams: [stream],
      topics: {
        // prettier-ignore
        [stream.stream_id]: [{ name: 'hi', max_id: 123 }, { name: 'wow', max_id: 234 }]
      },
    });

    const topics = getTopicsForNarrow(state, streamNarrow(stream.name));

    expect(topics).toEqual(['hi', 'wow']);
  });
});

describe('getLastMessageTopic', () => {
  test('when no messages in narrow return an empty string', () => {
    const state = eg.reduxState({
      narrows: Immutable.Map({}),
      users: [eg.selfUser],
      realm: eg.realmState({ user_id: eg.selfUser.user_id, email: eg.selfUser.email }),
    });

    const topic = getLastMessageTopic(state, HOME_NARROW);

    expect(topic).toEqual('');
  });

  test('when one or more messages return the topic of the last one', () => {
    const narrow = streamNarrow('hello');
    const message1 = eg.streamMessage({ id: 1 });
    const message2 = eg.streamMessage({ id: 2, subject: 'some topic' });
    const state = eg.reduxState({
      narrows: Immutable.Map({
        [keyFromNarrow(narrow)]: [1, 2],
      }),
      messages: eg.makeMessagesState([message1, message2]),
      users: [eg.selfUser],
      realm: eg.realmState({ user_id: eg.selfUser.user_id, email: eg.selfUser.email }),
    });

    const topic = getLastMessageTopic(state, narrow);

    expect(topic).toEqual(message2.subject);
  });
});

describe('getTopicsForStream', () => {
  test('when no topics loaded for given stream return undefined', () => {
    const state = eg.reduxState({
      streams: [],
      topics: {},
      mute: [],
    });

    const topics = getTopicsForStream(state, 123);

    expect(topics).toEqual(undefined);
  });

  test('when topics loaded for given stream return them', () => {
    const stream = { ...eg.makeStream({ name: 'stream 123' }), stream_id: 123 };
    const state = eg.reduxState({
      streams: [stream],
      topics: {
        [stream.stream_id]: [{ name: 'topic', max_id: 456 }],
      },
      mute: [],
    });

    const topics = getTopicsForStream(state, stream.stream_id);

    expect(topics).toEqual([{ name: 'topic', max_id: 456, isMuted: false, unreadCount: 0 }]);
  });

  test('Return list of topic object with isMuted, unreadCount, topic name and max id in it.', () => {
    const stream = { ...eg.makeStream({ name: 'stream 1' }), stream_id: 1 };

    const state = eg.reduxStatePlus({
      streams: [stream],
      topics: {
        [stream.stream_id]: [
          { name: 'topic 1', max_id: 5 },
          { name: 'topic 2', max_id: 6 },
          { name: 'topic 3', max_id: 7 },
          { name: 'topic 4', max_id: 8 },
          { name: 'topic 5', max_id: 9 },
        ],
      },
      // prettier-ignore
      mute: [['stream 1', 'topic 1'], ['stream 1', 'topic 3'], ['stream 2', 'topic 2']],
      unread: [
        eg.streamMessage({ stream_id: 1, subject: 'topic 2', id: 1 }),
        eg.streamMessage({ stream_id: 1, subject: 'topic 2', id: 5 }),
        eg.streamMessage({ stream_id: 1, subject: 'topic 2', id: 6 }),
        eg.streamMessage({ stream_id: 1, subject: 'topic 4', id: 7 }),
        eg.streamMessage({ stream_id: 1, subject: 'topic 4', id: 8 }),
      ].reduce(
        (st, message) => unreadReducer(st, eg.mkActionEventNewMessage(message), eg.plusReduxState),
        eg.plusReduxState.unread,
      ),
    });
    const expected = [
      { name: 'topic 1', max_id: 5, isMuted: true, unreadCount: 0 },
      { name: 'topic 2', max_id: 6, isMuted: false, unreadCount: 3 },
      { name: 'topic 3', max_id: 7, isMuted: true, unreadCount: 0 },
      { name: 'topic 4', max_id: 8, isMuted: false, unreadCount: 2 },
      { name: 'topic 5', max_id: 9, isMuted: false, unreadCount: 0 },
    ];

    const topics = getTopicsForStream(state, 1);

    expect(topics).toEqual(expected);
  });
});
