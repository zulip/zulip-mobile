import deepFreeze from 'deep-freeze';

import {
  getFirstMessageId,
  getLastMessageId,
  getUnreadPrivateMessagesCount,
  getLastTopicInActiveNarrow,
  getMessagesInActiveNarrow,
  getStreamInNarrow,
} from '../chatSelectors';
import {
  homeNarrow,
  homeNarrowStr,
  allPrivateNarrowStr,
  privateNarrow,
  streamNarrow,
} from '../../utils/narrow';

import { NULL_SUBSCRIPTION } from '../../nullObjects';

describe('getMessagesInActiveNarrow', () => {
  test('Combine messages & outbox in same narrow', () => {
    const state = deepFreeze({
      chat: {
        narrow: homeNarrow,
        messages: {
          '[]': [{ id: 123 }],
        },
      },
      outbox: [
        {
          email: 'donald@zulip.com',
          narrow: homeNarrow,
          parsedContent: '<p>Hello</p>',
          sender_full_name: 'donald',
          timestamp: 12,
        },
      ],
    });

    const anchor = getMessagesInActiveNarrow(state);

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

  test('Do not combine messages & outbox in different narrow', () => {
    const state = deepFreeze({
      chat: {
        narrow: privateNarrow('john@example.com'),
        messages: {
          [JSON.stringify(privateNarrow('john@example.com'))]: [{ id: 123 }],
        },
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

    const anchor = getMessagesInActiveNarrow(state);

    const expectedState = deepFreeze([{ id: 123 }]);

    expect(anchor).toEqual(expectedState);
  });
});

describe('getFirstMessageId', () => {
  test('return undefined when there are no messages', () => {
    const state = deepFreeze({
      chat: {
        narrow: homeNarrow,
        messages: {
          '[]': [],
        },
      },
      outbox: [],
    });

    const anchor = getFirstMessageId(state);

    expect(anchor).toEqual(undefined);
  });

  test('returns first message id', () => {
    const state = deepFreeze({
      chat: {
        narrow: homeNarrow,
        messages: {
          '[]': [{ id: 1 }, { id: 2 }, { id: 3 }],
        },
      },
      outbox: [],
    });

    const anchor = getFirstMessageId(state);

    expect(anchor).toEqual(1);
  });
});

describe('getLastMessageId', () => {
  test('return undefined when there are no messages', () => {
    const state = deepFreeze({
      chat: {
        narrow: homeNarrow,
        messages: {
          '[]': [],
        },
      },
      outbox: [],
    });

    const anchor = getLastMessageId(state);

    expect(anchor).toEqual(undefined);
  });

  test('returns last message id', () => {
    const state = deepFreeze({
      chat: {
        narrow: homeNarrow,
        messages: {
          '[]': [{ id: 1 }, { id: 2 }, { id: 3 }],
        },
      },
      outbox: [],
    });

    const anchor = getLastMessageId(state);

    expect(anchor).toEqual(3);
  });
});

describe('getUnreadPrivateMessagesCount', () => {
  test('when no private messages, unread count is 0', () => {
    const state = deepFreeze({
      flags: {},
      chat: {
        messages: {
          '[]': [],
        },
      },
      outbox: [],
    });

    const actualCount = getUnreadPrivateMessagesCount(state);

    expect(actualCount).toEqual(0);
  });

  test('count all messages in "private messages" narrow, skip read', () => {
    const state = deepFreeze({
      chat: {
        messages: {
          '[]': [{ id: 1 }, { id: 2 }],
          [allPrivateNarrowStr]: [{ id: 2 }, { id: 3 }, { id: 4 }],
        },
      },
      flags: {
        read: {
          3: true,
        },
      },
      outbox: [],
    });

    const actualCount = getUnreadPrivateMessagesCount(state);

    expect(actualCount).toEqual(2);
  });
});

describe('getLastTopicInActiveNarrow', () => {
  test('when no messages yet, return empty string', () => {
    const state = deepFreeze({
      chat: {
        narrow: homeNarrow,
        messages: {},
      },
    });

    const actualLastTopic = getLastTopicInActiveNarrow(state);

    expect(actualLastTopic).toEqual('');
  });

  test('when last message has a `subject` property, return it', () => {
    const state = deepFreeze({
      chat: {
        narrow: homeNarrow,
        messages: {
          [homeNarrowStr]: [
            { id: 0, subject: 'First subject' },
            { id: 1, subject: 'Last subject' },
          ],
        },
      },
      outbox: [],
    });

    const actualLastTopic = getLastTopicInActiveNarrow(state);

    expect(actualLastTopic).toEqual('Last subject');
  });

  test('when there are messages, but none with a `subject` property, return empty', () => {
    const narrow = privateNarrow('john@example.com');
    const state = deepFreeze({
      chat: {
        narrow,
        messages: {
          [JSON.stringify(narrow)]: [{ id: 0 }],
        },
      },
      outbox: [],
    });

    const actualLastTopic = getLastTopicInActiveNarrow(state);

    expect(actualLastTopic).toEqual('');
  });

  test('when last message has no `subject` property, return last one that has', () => {
    const narrow = privateNarrow('john@example.com');
    const state = deepFreeze({
      chat: {
        narrow,
        messages: {
          [JSON.stringify(narrow)]: [{ id: 0 }, { id: 1, subject: 'Some subject' }, { id: 2 }],
        },
      },
      outbox: [],
    });

    const actualLastTopic = getLastTopicInActiveNarrow(state);

    expect(actualLastTopic).toEqual('Some subject');
  });
});

describe('getStreamInNarrow', () => {
  test('get stream in current narrow', () => {
    const state = deepFreeze({
      chat: {
        narrow: streamNarrow('all'),
      },
      streams: [{ name: 'all' }],
      subscriptions: [{ name: 'all' }],
    });
    const actualStream = getStreamInNarrow(state);

    expect(actualStream).toEqual({ name: 'all' });
  });

  test('return null subscriptions if current narrow stream is outdated', () => {
    const state = deepFreeze({
      chat: {
        narrow: streamNarrow('election 17'),
      },
      streams: [{ name: 'all' }],
      subscriptions: [{ name: 'all' }],
    });
    const actualStream = getStreamInNarrow(state);

    expect(actualStream).toEqual(NULL_SUBSCRIPTION);
  });
});
