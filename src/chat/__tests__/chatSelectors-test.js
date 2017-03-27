import {
  getAnchor,
  getRecentConversations,
  getUnreadPrivateMessagesCount,
  getCurrentTypingUser,
} from '../chatSelectors';
import { specialNarrow, privateNarrow, groupNarrow } from '../../utils/narrow';

describe('getAnchor', () => {
  test('return undefined when there are no messages', () => {
    const state = {
      chat: {
        narrow: [],
        messages: {
          '[]': [],
        },
      },
    };
    expect(getAnchor(state)).toEqual(undefined);
  });

  test('when single message, anchor ids are the same', () => {
    const state = {
      chat: {
        narrow: [],
        messages: {
          '[]': [{ id: 123 }],
        },
      },
    };
    expect(getAnchor(state)).toEqual({ older: 123, newer: 123 });
  });

  test('when two or more messages, anchor contains first and last message ids', () => {
    const state = {
      chat: {
        narrow: [],
        messages: {
          '[]': [{ id: 1 }, { id: 2 }, { id: 3 }],
        },
      },
    };
    expect(getAnchor(state)).toEqual({ older: 1, newer: 3 });
  });
});

describe('getRecentConversations', () => {
  const privatesNarrowStr = JSON.stringify(specialNarrow('private'));

  test('when no messages, return no conversations', () => {
    const state = {
      accounts: [{ email: 'me@example.com' }],
      flags: { read: {} },
      chat: {
        narrow: [],
        messages: {
          [privatesNarrowStr]: [],
        },
      },
    };

    const actual = getRecentConversations(state);

    expect(actual).toEqual([]);
  });

  test('returns unique list of recipients, includes conversations with self', () => {
    const state = {
      accounts: [{ email: 'me@example.com' }],
      flags: { read: {} },
      chat: {
        messages: {
          [privatesNarrowStr]: [
            { display_recipient: [{ email: 'me@example.com' }, { email: 'john@example.com' }] },
            { display_recipient: [{ email: 'mark@example.com' }] },
            { display_recipient: [{ email: 'john@example.com' }] },
            { display_recipient: [{ email: 'me@example.com' }] },
            { display_recipient: [{ email: 'john@example.com' }, { email: 'mark@example.com' }] },
          ],
        },
      },
    };

    const expectedPrivate = [
      { recipients: 'john@example.com', timestamp: 0, unread: 2 },
      { recipients: 'mark@example.com', timestamp: 0, unread: 1 },
      { recipients: 'me@example.com', timestamp: 0, unread: 1 },
      { recipients: 'john@example.com,mark@example.com', timestamp: 0, unread: 1 },
    ];

    const actual = getRecentConversations(state);

    expect(actual).toEqual(expectedPrivate);
  });

  test('returns recipients sorted by last activity', () => {
    const state = {
      accounts: [{ email: 'me@example.com' }],
      flags: { read: {} },
      chat: {
        messages: {
          [privatesNarrowStr]: [
            {
              display_recipient: [{ email: 'me@example.com' }, { email: 'john@example.com' }],
              timestamp: 2,
            },
            {
              display_recipient: [{ email: 'mark@example.com' }],
              timestamp: 1,
            },
            {
              display_recipient: [{ email: 'john@example.com' }],
              timestamp: 4,
            },
            {
              display_recipient: [{ email: 'mark@example.com' }],
              timestamp: 3,
            },
            {
              display_recipient: [{ email: 'john@example.com' }, { email: 'mark@example.com' }],
              timestamp: 5,
            },
            {
              display_recipient: [{ email: 'me@example.com' }],
              timestamp: 6,
            },
          ],
        },
      },
    };

    const expectedPrivate = [
      {
        recipients: 'me@example.com',
        timestamp: 6,
        unread: 1,
      },
      {
        recipients: 'john@example.com,mark@example.com',
        timestamp: 5,
        unread: 1,
      },
      {
        recipients: 'john@example.com',
        timestamp: 4,
        unread: 2,
      },
      {
        recipients: 'mark@example.com',
        timestamp: 3,
        unread: 2,
      },
    ];

    const actual = getRecentConversations(state);

    expect(actual).toEqual(expectedPrivate);
  });
});

describe('getCurrentTypingUser', () => {
  test('return undefined when current narrow is not private or group', () => {
    const state = {
      chat: {
        narrow: [],
      },
    };
    const typingUser = getCurrentTypingUser(state);

    expect(typingUser).toEqual(undefined);
  });

  test('when in private narrow and the same user is typing return details', () => {
    const expectedUser = {
      email: 'john@example.com',
      avatarUrl: 'http://example.com/avatar.png',
      fullName: 'John Doe',
    };
    const state = {
      accounts: [{ email: 'me@example.com' }],
      chat: {
        narrow: privateNarrow('john@example.com'),
      },
      typing: {
        'john@example.com': 'john@example.com',
      },
      users: [expectedUser],
    };

    const typingUser = getCurrentTypingUser(state);

    expect(typingUser).toEqual(expectedUser);
  });

  test('when in private narrow but different user is typing return undefined', () => {
    const state = {
      accounts: [{ email: 'me@example.com' }],
      chat: {
        narrow: privateNarrow('mark@example.com'),
      },
      typing: {
        'john@example.com': 'john@example.com',
      }
    };
    const typingUser = getCurrentTypingUser(state);

    expect(typingUser).toEqual(undefined);
  });

  test('when in group narrow and someone is typing in that narrow return details', () => {
    const expectedUser = {
      email: 'john@example.com',
      avatarUrl: 'http://example.com/avatar.png',
      fullName: 'John Doe',
    };
    const state = {
      accounts: [{ email: 'me@example.com' }],
      chat: {
        narrow: groupNarrow(['mark@example.com', 'john@example.com']),
      },
      typing: {
        'john@example.com,mark@example.com': 'john@example.com',
      },
      users: [expectedUser],
    };

    const typingUser = getCurrentTypingUser(state);

    expect(typingUser).toEqual(expectedUser);
  });
});

describe('getUnreadPrivateMessagesCount', () => {
  test('when no private messages, unread count is 0', () => {
    const state = {
      flags: {},
      chat: {
        messages: {
          '[]': [],
        },
      },
    };

    const actualCount = getUnreadPrivateMessagesCount(state);

    expect(actualCount).toEqual(0);
  });

  test('count all messages in "private messages" narrow, skip read', () => {
    const privateNarrowStr = JSON.stringify(specialNarrow('private'));

    const state = {
      chat: {
        messages: {
          '[]': [{ id: 1 }, { id: 2 }],
          [privateNarrowStr]: [{ id: 2 }, { id: 3 }, { id: 4 }],
        },
      },
      flags: {
        read: {
          3: true,
        },
      },
    };

    const actualCount = getUnreadPrivateMessagesCount(state);

    expect(actualCount).toEqual(2);
  });
});
