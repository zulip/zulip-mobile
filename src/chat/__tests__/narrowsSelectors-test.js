import deepFreeze from 'deep-freeze';

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

describe('getMessagesForNarrow', () => {
  test('if no outbox messages returns messages with no change', () => {
    const state = deepFreeze({
      narrows: {
        '[]': [123],
      },
      messages: {
        123: { id: 123 },
      },
      outbox: [],
    });

    const expectedState = deepFreeze([state.messages[123]]);

    const anchor = getMessagesForNarrow(state, HOME_NARROW);

    expect(anchor).toEqual(expectedState);
  });

  test('combine messages and outbox in same narrow', () => {
    const state = deepFreeze({
      narrows: {
        '[]': [123],
      },
      messages: {
        123: { id: 123 },
      },
      outbox: [
        {
          email: 'donald@zulip.com',
          narrow: HOME_NARROW,
          parsedContent: '<p>Hello</p>',
          sender_full_name: 'donald',
          timestamp: 12,
        },
      ],
      caughtUp: {
        [HOME_NARROW_STR]: { older: false, newer: true },
      },
    });

    const anchor = getMessagesForNarrow(state, HOME_NARROW);

    const expectedState = deepFreeze([
      { id: 123 },
      {
        email: 'donald@zulip.com',
        narrow: [],
        parsedContent: '<p>Hello</p>',
        sender_full_name: 'donald',
        timestamp: 12,
      },
    ]);

    expect(anchor).toEqual(expectedState);
  });

  test('do not combine messages and outbox if not caught up', () => {
    const state = deepFreeze({
      narrows: {
        [HOME_NARROW_STR]: [123],
      },
      messages: {
        123: { id: 123 },
      },
      outbox: [
        {
          email: 'donald@zulip.com',
          narrow: HOME_NARROW,
          parsedContent: '<p>Hello</p>',
          sender_full_name: 'donald',
          timestamp: 12,
        },
      ],
    });

    const expectedState = deepFreeze([state.messages[123]]);

    const anchor = getMessagesForNarrow(state, HOME_NARROW);

    expect(anchor).toEqual(expectedState);
  });

  test('do not combine messages and outbox in different narrow', () => {
    const state = deepFreeze({
      narrows: {
        [JSON.stringify(privateNarrow('john@example.com'))]: [123],
      },
      messages: {
        123: { id: 123 },
      },
      outbox: [
        {
          email: 'donald@zulip.com',
          narrow: streamNarrow('denmark', 'denmark'),
          parsedContent: '<p>Hello</p>',
          sender_full_name: 'donald',
          timestamp: 12,
        },
      ],
    });

    const anchor = getMessagesForNarrow(state, privateNarrow('john@example.com'));

    const expectedState = deepFreeze([{ id: 123 }]);

    expect(anchor).toEqual(expectedState);
  });
});

describe('getFirstMessageId', () => {
  test('return undefined when there are no messages', () => {
    const state = deepFreeze({
      narrows: {
        '[]': [],
      },
      outbox: [],
    });

    const anchor = getFirstMessageId(state, HOME_NARROW);

    expect(anchor).toEqual(undefined);
  });

  test('returns first message id', () => {
    const state = deepFreeze({
      narrows: {
        '[]': [1, 2, 3],
      },
      messages: {
        1: { id: 1 },
        2: { id: 2 },
        3: { id: 3 },
      },
      outbox: [],
    });

    const anchor = getFirstMessageId(state, HOME_NARROW);

    expect(anchor).toEqual(1);
  });
});

describe('getLastMessageId', () => {
  test('return undefined when there are no messages', () => {
    const state = deepFreeze({
      narrows: {
        '[]': [],
      },
      messages: {},
      outbox: [],
    });

    const anchor = getLastMessageId(state, HOME_NARROW);

    expect(anchor).toEqual(undefined);
  });

  test('returns last message id', () => {
    const state = deepFreeze({
      narrows: {
        '[]': [1, 2, 3],
      },
      messages: {
        1: { id: 1 },
        2: { id: 2 },
        3: { id: 3 },
      },
      outbox: [],
    });

    const anchor = getLastMessageId(state, HOME_NARROW);

    expect(anchor).toEqual(3);
  });
});

describe('getStreamInNarrow', () => {
  const state = deepFreeze({
    streams: [{ name: 'stream' }, { name: 'steam2' }, { name: 'stream3' }],
    subscriptions: [
      { name: 'stream', in_home_view: false },
      { name: 'stream2', in_home_view: true },
    ],
  });

  test('return subscription if stream in narrow is subscribed', () => {
    const narrow = streamNarrow('stream');

    expect(getStreamInNarrow(state, narrow)).toEqual({ name: 'stream', in_home_view: false });
  });

  test('return stream if stream in narrow is not subscribed', () => {
    const narrow = streamNarrow('stream3');

    expect(getStreamInNarrow(state, narrow)).toEqual({ name: 'stream3', in_home_view: true });
  });

  test('return NULL_SUBSCRIPTION if stream in narrow is not valid', () => {
    const narrow = streamNarrow('stream4');

    expect(getStreamInNarrow(state, narrow)).toEqual(NULL_SUBSCRIPTION);
  });

  test('return NULL_SUBSCRIPTION is narrow is not topic or stream', () => {
    expect(getStreamInNarrow(state, undefined)).toEqual(NULL_SUBSCRIPTION);
    expect(getStreamInNarrow(state, privateNarrow('abc@zulip.com'))).toEqual(NULL_SUBSCRIPTION);
    expect(getStreamInNarrow(state, topicNarrow('stream4', 'topic'))).toEqual(NULL_SUBSCRIPTION);
  });
});

describe('isNarrowValid', () => {
  test('narrowing to a special narrow is always valid', () => {
    const state = {
      realm: {},
    };
    const narrow = STARRED_NARROW;

    const result = isNarrowValid(state, narrow);

    expect(result).toBe(true);
  });

  test('narrowing to an existing stream is valid', () => {
    const state = {
      realm: {},
      streams: [{ name: 'some stream' }],
    };
    const narrow = streamNarrow('some stream');

    const result = isNarrowValid(state, narrow);

    expect(result).toBe(true);
  });

  test('narrowing to a non-existing stream is invalid', () => {
    const state = {
      realm: {},
      streams: [],
    };
    const narrow = streamNarrow('nonexisting');

    const result = isNarrowValid(state, narrow);

    expect(result).toBe(false);
  });

  test('narrowing to an existing stream is valid regardless of topic', () => {
    const state = {
      realm: {},
      streams: [{ name: 'some stream' }],
    };
    const narrow = topicNarrow('some stream', 'topic does not matter');

    const result = isNarrowValid(state, narrow);

    expect(result).toBe(true);
  });

  test('narrowing to a PM with existing user is valid', () => {
    const state = {
      realm: {
        crossRealmBots: [],
        nonActiveUsers: [],
      },
      streams: [],
      users: [{ email: 'bob@example.com' }],
    };
    const narrow = privateNarrow('bob@example.com');

    const result = isNarrowValid(state, narrow);

    expect(result).toBe(true);
  });

  test('narrowing to a PM with non-existing user is not valid', () => {
    const state = {
      realm: {
        crossRealmBots: [],
        nonActiveUsers: [],
      },
      streams: [],
      users: [],
    };
    const narrow = privateNarrow('bob@example.com');

    const result = isNarrowValid(state, narrow);

    expect(result).toBe(false);
  });

  test('narrowing to a group chat with non-existing user is not valid', () => {
    const state = {
      realm: {
        crossRealmBots: [],
        nonActiveUsers: [],
      },
      streams: [],
      users: [{ email: 'john@example.com' }, { email: 'mark@example.com' }],
    };
    const narrow = groupNarrow(['john@example.com', 'mark@example.com']);

    const result = isNarrowValid(state, narrow);

    expect(result).toBe(true);
  });

  test('narrowing to a group chat with non-existing users is also valid', () => {
    const state = {
      realm: {
        crossRealmBots: [],
        nonActiveUsers: [],
      },
      streams: [],
      users: [],
    };
    const narrow = groupNarrow(['john@example.com', 'mark@example.com']);

    const result = isNarrowValid(state, narrow);

    expect(result).toBe(true);
  });

  test('narrowing to a PM with bots is valid', () => {
    const state = {
      realm: {
        crossRealmBots: [{ email: 'some-bot@example.com' }],
        nonActiveUsers: [],
      },
      streams: [],
      users: [],
    };
    const narrow = privateNarrow('some-bot@example.com');

    const result = isNarrowValid(state, narrow);

    expect(result).toBe(true);
  });

  test('narrowing to non active users is valid', () => {
    const state = {
      realm: {
        crossRealmBots: [],
        nonActiveUsers: [{ email: 'not-active@example.com' }],
      },
      streams: [],
      users: [],
    };
    const narrow = privateNarrow('not-active@example.com');

    const result = isNarrowValid(state, narrow);

    expect(result).toBe(true);
  });
});
