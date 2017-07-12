import deepFreeze from 'deep-freeze';

import {
  getAnchor,
  getRecentConversations,
  getUnreadPrivateMessagesCount,
  getCurrentTypingUsers,
  getLastTopicInActiveNarrow,
} from '../chatSelectors';
import { homeNarrow, specialNarrow, privateNarrow, groupNarrow } from '../../utils/narrow';

describe('getAnchor', () => {
  test('return undefined when there are no messages', () => {
    const state = {
      chat: {
        narrow: homeNarrow(),
        messages: {
          '[]': [],
        },
      },
    };
    deepFreeze(state);

    const anchor = getAnchor(state);

    expect(anchor).toEqual(undefined);
  });

  test('when single message, anchor ids are the same', () => {
    const state = {
      chat: {
        narrow: homeNarrow(),
        messages: {
          '[]': [{ id: 123 }],
        },
      },
    };
    deepFreeze(state);

    const anchor = getAnchor(state);

    expect(anchor).toEqual({ older: 123, newer: 123 });
  });

  test('when two or more messages, anchor contains first and last message ids', () => {
    const state = {
      chat: {
        narrow: homeNarrow(),
        messages: {
          '[]': [{ id: 1 }, { id: 2 }, { id: 3 }],
        },
      },
    };
    deepFreeze(state);

    const anchor = getAnchor(state);

    expect(anchor).toEqual({ older: 1, newer: 3 });
  });
});

describe('getRecentConversations', () => {
  const privatesNarrowStr = JSON.stringify(specialNarrow('private'));

  test('when no messages, return no conversations', () => {
    const state = {
      accounts: [{ email: 'me@example.com' }],
      flags: { read: {} },
      chat: {
        narrow: homeNarrow(),
        messages: {
          [privatesNarrowStr]: [],
        },
      },
    };
    deepFreeze(state);

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
    deepFreeze(state);
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
    deepFreeze(state);
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

describe('getCurrentTypingUsers', () => {
  test('return undefined when current narrow is not private or group', () => {
    const state = {
      accounts: [{}],
      chat: {
        narrow: homeNarrow(),
      },
    };
    deepFreeze(state);

    const typingUsers = getCurrentTypingUsers(state);

    expect(typingUsers).toEqual(undefined);
  });

  test('when in private narrow and the same user is typing return details', () => {
    const expectedUser = {
      id: 1,
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
        'john@example.com': [1],
      },
      users: [expectedUser],
    };
    deepFreeze(state);

    const typingUsers = getCurrentTypingUsers(state);

    expect(typingUsers).toEqual([expectedUser]);
  });

  test('when two people are typing, return details for all of them', () => {
    const user1 = {
      id: 1,
      email: 'john@example.com',
      avatarUrl: 'http://example.com/avatar1.png',
      fullName: 'John Doe',
    };
    const user2 = {
      id: 2,
      email: 'mark@example.com',
      avatarUrl: 'http://example.com/avatar2.png',
      fullName: 'Mark Dark',
    };
    const state = {
      accounts: [{ email: 'me@example.com' }],
      chat: {
        narrow: groupNarrow(['john@example.com', 'mark@example.com']),
      },
      typing: {
        'john@example.com,mark@example.com': [1, 2],
      },
      users: [user1, user2],
    };
    deepFreeze(state);

    const typingUsers = getCurrentTypingUsers(state);

    expect(typingUsers).toEqual([user1, user2]);
  });

  test('when in private narrow but different user is typing return undefined', () => {
    const state = {
      accounts: [{ email: 'me@example.com' }],
      chat: {
        narrow: privateNarrow('mark@example.com'),
      },
      typing: {
        'john@example.com': [1],
      },
    };
    deepFreeze(state);

    const typingUsers = getCurrentTypingUsers(state);

    expect(typingUsers).toEqual(undefined);
  });

  test('when in group narrow and someone is typing in that narrow return details', () => {
    const expectedUser = {
      id: 1,
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
        'john@example.com,mark@example.com': [1],
      },
      users: [expectedUser],
    };
    deepFreeze(state);

    const typingUsers = getCurrentTypingUsers(state);

    expect(typingUsers).toEqual([expectedUser]);
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
    deepFreeze(state);

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
    deepFreeze(state);

    const actualCount = getUnreadPrivateMessagesCount(state);

    expect(actualCount).toEqual(2);
  });
});

describe('getLastTopicInActiveNarrow', () => {
  test('when no messages yet, return empty string', () => {
    const state = {
      chat: {
        narrow: homeNarrow(),
        messages: {},
      },
    };
    deepFreeze(state);

    const actualLastTopic = getLastTopicInActiveNarrow(state);

    expect(actualLastTopic).toEqual('');
  });

  test('when last message has a `subject` property, return it', () => {
    const narrow = homeNarrow();
    const state = {
      chat: {
        narrow,
        messages: {
          [JSON.stringify(narrow)]: [
            { id: 0, subject: 'First subject' },
            { id: 1, subject: 'Last subject' },
          ],
        },
      },
    };
    deepFreeze(state);

    const actualLastTopic = getLastTopicInActiveNarrow(state);

    expect(actualLastTopic).toEqual('Last subject');
  });

  test('when there are messages, but none with a `subject` property, return empty', () => {
    const narrow = privateNarrow('john@example.com');
    const state = {
      chat: {
        narrow,
        messages: {
          [JSON.stringify(narrow)]: [{ id: 0 }],
        },
      },
    };
    deepFreeze(state);

    const actualLastTopic = getLastTopicInActiveNarrow(state);

    expect(actualLastTopic).toEqual('');
  });

  test('when last message has no `subject` property, return last one that has', () => {
    const narrow = privateNarrow('john@example.com');
    const state = {
      chat: {
        narrow,
        messages: {
          [JSON.stringify(narrow)]: [{ id: 0 }, { id: 1, subject: 'Some subject' }, { id: 2 }],
        },
      },
    };
    deepFreeze(state);

    const actualLastTopic = getLastTopicInActiveNarrow(state);

    expect(actualLastTopic).toEqual('Some subject');
  });
});
