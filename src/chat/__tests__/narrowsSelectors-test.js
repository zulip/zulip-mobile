/* @flow strict-local */
import {
  getFirstMessageId,
  getLastMessageId,
  getMessagesForNarrow,
  getStreamInNarrow,
  isNarrowValid,
} from '../narrowsSelectors';
import {
  HOME_NARROW,
  HOME_NARROW_STR,
  privateNarrow,
  streamNarrow,
  topicNarrow,
  STARRED_NARROW,
  groupNarrow,
} from '../../utils/narrow';
import { NULL_SUBSCRIPTION } from '../../nullObjects';
import * as eg from '../../__tests__/lib/exampleData';

describe('getMessagesForNarrow', () => {
  const message = eg.streamMessage({ id: 123 });
  const messages = {
    // Flow doesn't like number literals as keys...but it also wants
    // them to be numbers.
    [123]: message /* eslint-disable-line no-useless-computed-key */,
  };
  const outboxMessage = eg.makeOutboxMessage({});

  test('if no outbox messages returns messages with no change', () => {
    const state = eg.reduxState({
      narrows: {
        '[]': [123],
      },
      messages,
      outbox: [],
    });

    const result = getMessagesForNarrow(state, HOME_NARROW);

    expect(result).toEqual([state.messages[123]]);
  });

  test('combine messages and outbox in same narrow', () => {
    const state = eg.reduxState({
      narrows: {
        '[]': [123],
      },
      messages,
      outbox: [outboxMessage],
      caughtUp: {
        [HOME_NARROW_STR]: { older: false, newer: true },
      },
    });

    const result = getMessagesForNarrow(state, HOME_NARROW);

    expect(result).toEqual([message, outboxMessage]);
  });

  test('do not combine messages and outbox if not caught up', () => {
    const state = eg.reduxState({
      narrows: {
        [HOME_NARROW_STR]: [123],
      },
      messages,
      outbox: [outboxMessage],
    });

    const result = getMessagesForNarrow(state, HOME_NARROW);

    expect(result).toEqual([state.messages[123]]);
  });

  test('do not combine messages and outbox in different narrow', () => {
    const state = eg.reduxState({
      narrows: {
        [JSON.stringify(privateNarrow('john@example.com'))]: [123],
      },
      messages,
      outbox: [{ ...outboxMessage, narrow: streamNarrow('denmark') }],
    });

    const result = getMessagesForNarrow(state, privateNarrow('john@example.com'));

    expect(result).toEqual([message]);
  });
});

describe('getFirstMessageId', () => {
  test('return undefined when there are no messages', () => {
    const state = eg.reduxState({
      narrows: {
        '[]': [],
      },
      outbox: [],
    });

    const result = getFirstMessageId(state, HOME_NARROW);

    expect(result).toEqual(undefined);
  });

  test('returns first message id', () => {
    const state = eg.reduxState({
      narrows: {
        '[]': [1, 2, 3],
      },
      messages: {
        [1]: eg.streamMessage({ id: 1 }) /* eslint-disable-line no-useless-computed-key */,
        [2]: eg.streamMessage({ id: 2 }) /* eslint-disable-line no-useless-computed-key */,
        [3]: eg.streamMessage({ id: 3 }) /* eslint-disable-line no-useless-computed-key */,
      },
      outbox: [],
    });

    const result = getFirstMessageId(state, HOME_NARROW);

    expect(result).toEqual(1);
  });
});

describe('getLastMessageId', () => {
  test('return undefined when there are no messages', () => {
    const state = eg.reduxState({
      narrows: {
        '[]': [],
      },
      messages: {},
      outbox: [],
    });

    const result = getLastMessageId(state, HOME_NARROW);

    expect(result).toEqual(undefined);
  });

  test('returns last message id', () => {
    const state = eg.reduxState({
      narrows: {
        '[]': [1, 2, 3],
      },
      messages: {
        [1]: eg.streamMessage({ id: 1 }) /* eslint-disable-line no-useless-computed-key */,
        [2]: eg.streamMessage({ id: 2 }) /* eslint-disable-line no-useless-computed-key */,
        [3]: eg.streamMessage({ id: 3 }) /* eslint-disable-line no-useless-computed-key */,
      },
      outbox: [],
    });

    const result = getLastMessageId(state, HOME_NARROW);

    expect(result).toEqual(3);
  });
});

describe('getStreamInNarrow', () => {
  const stream1 = eg.makeStream({ name: 'stream' });
  const stream2 = eg.makeStream({ name: 'stream2' });
  const stream3 = eg.makeStream({ name: 'stream3' });
  const stream4 = eg.makeStream({ name: 'stream4' });
  const sub1 = { ...eg.makeSubscription({ stream: stream1 }), in_home_view: false };
  const sub2 = { ...eg.makeSubscription({ stream: stream2 }), in_home_view: true };

  const state = eg.reduxState({
    streams: [stream1, stream2, stream3],
    subscriptions: [sub1, sub2],
  });

  test('return subscription if stream in narrow is subscribed', () => {
    const narrow = streamNarrow(stream1.name);

    expect(getStreamInNarrow(state, narrow)).toEqual(sub1);
  });

  test('return stream if stream in narrow is not subscribed', () => {
    const narrow = streamNarrow(stream3.name);

    expect(getStreamInNarrow(state, narrow)).toEqual({ ...stream3, in_home_view: true });
  });

  test('return NULL_SUBSCRIPTION if stream in narrow is not valid', () => {
    const narrow = streamNarrow(stream4.name);

    expect(getStreamInNarrow(state, narrow)).toEqual(NULL_SUBSCRIPTION);
  });

  test('return NULL_SUBSCRIPTION is narrow is not topic or stream', () => {
    expect(getStreamInNarrow(state, privateNarrow('abc@zulip.com'))).toEqual(NULL_SUBSCRIPTION);
    expect(getStreamInNarrow(state, topicNarrow(stream4.name, 'topic'))).toEqual(NULL_SUBSCRIPTION);
  });
});

describe('isNarrowValid', () => {
  test('narrowing to a special narrow is always valid', () => {
    const state = eg.reduxState();
    const narrow = STARRED_NARROW;

    const result = isNarrowValid(state, narrow);

    expect(result).toBe(true);
  });

  test('narrowing to an existing stream is valid', () => {
    const stream = eg.makeStream({ name: 'some stream' });

    const state = eg.reduxState({
      streams: [stream],
    });
    const narrow = streamNarrow(stream.name);

    const result = isNarrowValid(state, narrow);

    expect(result).toBe(true);
  });

  test('narrowing to a non-existing stream is invalid', () => {
    const state = eg.reduxState({
      streams: [],
    });
    const narrow = streamNarrow('nonexisting');

    const result = isNarrowValid(state, narrow);

    expect(result).toBe(false);
  });

  test('narrowing to an existing stream is valid regardless of topic', () => {
    const stream = eg.makeStream({ name: 'some stream' });

    const state = eg.reduxState({
      streams: [stream],
    });
    const narrow = topicNarrow(stream.name, 'topic does not matter');

    const result = isNarrowValid(state, narrow);

    expect(result).toBe(true);
  });

  test('narrowing to a PM with existing user is valid', () => {
    const user = eg.makeUser({ name: 'bob' });
    const state = eg.reduxState({
      realm: {
        ...eg.realmState(),
        crossRealmBots: [],
        nonActiveUsers: [],
      },
      streams: [],
      users: [user],
    });
    const narrow = privateNarrow(user.email);

    const result = isNarrowValid(state, narrow);

    expect(result).toBe(true);
  });

  test('narrowing to a PM with non-existing user is not valid', () => {
    const user = eg.makeUser({ name: 'bob' });
    const state = eg.reduxState({
      realm: {
        ...eg.realmState(),
        crossRealmBots: [],
        nonActiveUsers: [],
      },
      streams: [],
      users: [],
    });
    const narrow = privateNarrow(user.email);

    const result = isNarrowValid(state, narrow);

    expect(result).toBe(false);
  });

  test('narrowing to a group chat with non-existing user is not valid', () => {
    const john = eg.makeUser({ name: 'john' });
    const mark = eg.makeUser({ name: 'mark' });

    const state = eg.reduxState({
      realm: {
        ...eg.realmState(),
        crossRealmBots: [],
        nonActiveUsers: [],
      },
      streams: [],
      users: [john, mark],
    });
    const narrow = groupNarrow([john.email, mark.email]);

    const result = isNarrowValid(state, narrow);

    expect(result).toBe(true);
  });

  test('narrowing to a group chat with non-existing users is also valid', () => {
    const state = eg.reduxState({
      realm: {
        ...eg.realmState(),
        crossRealmBots: [],
        nonActiveUsers: [],
      },
      streams: [],
      users: [],
    });
    const narrow = groupNarrow(['john@example.com', 'mark@example.com']);

    const result = isNarrowValid(state, narrow);

    expect(result).toBe(true);
  });

  test('narrowing to a PM with bots is valid', () => {
    const bot = eg.makeCrossRealmBot({ name: 'some-bot' });
    const state = eg.reduxState({
      realm: {
        ...eg.realmState(),
        crossRealmBots: [bot],
        nonActiveUsers: [],
      },
      streams: [],
      users: [],
    });
    const narrow = privateNarrow(bot.email);

    const result = isNarrowValid(state, narrow);

    expect(result).toBe(true);
  });

  test('narrowing to non active users is valid', () => {
    const notActiveUser = eg.makeUser({ name: 'not active' });
    const state = eg.reduxState({
      realm: {
        ...eg.realmState(),
        crossRealmBots: [],
        nonActiveUsers: [notActiveUser],
      },
      streams: [],
      users: [],
    });
    const narrow = privateNarrow(notActiveUser.email);

    const result = isNarrowValid(state, narrow);

    expect(result).toBe(true);
  });
});
