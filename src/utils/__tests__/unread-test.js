import { filterUnreadMessageIds, filterUnreadMessagesInRange } from '../unread';

describe('filterUnreadMessageIds', () => {
  test('empty message list has no unread messages', () => {
    const messages = [];
    const flags = {};
    const expectedUnread = [];

    const actualUnread = filterUnreadMessageIds(messages, flags);

    expect(actualUnread).toEqual(expectedUnread);
  });

  test('messages with no flags or empty flag array are not read', () => {
    const messages = [1, 2, 3];
    const flags = {
      read: {
        3: true,
      },
    };
    const expectedUnread = [1, 2];

    const actualUnread = filterUnreadMessageIds(messages, flags);

    expect(actualUnread).toEqual(expectedUnread);
  });

  test('messages are not read if not in flags object, regardless of message property', () => {
    const messages = [1];
    const flags = {};
    const expectedUnread = [1];

    const actualUnread = filterUnreadMessageIds(messages, flags);

    expect(actualUnread).toEqual(expectedUnread);
  });
});

describe('filterUnreadMessagesInRange', () => {
  test('if from or to ids are -1 result is empty', () => {
    const messages = [{ id: 1 }];
    const flags = {};
    const expectedUnread = [];

    const actualUnread = filterUnreadMessagesInRange(messages, flags, -1, -1);

    expect(actualUnread).toEqual(expectedUnread);
  });

  test('empty message list has no unread messages', () => {
    const messages = [];
    const flags = {};
    const expectedUnread = [];

    const actualUnread = filterUnreadMessagesInRange(messages, flags, 1, 5);

    expect(actualUnread).toEqual(expectedUnread);
  });

  test('messages with no flags or empty flag array are not read', () => {
    const messages = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }, { id: 6 }];
    const flags = {
      read: {
        3: true,
      },
    };
    const expectedUnread = [2, 4, 5];

    const actualUnread = filterUnreadMessagesInRange(messages, flags, 2, 5);

    expect(actualUnread).toEqual(expectedUnread);
  });

  test('if start is after end no messages are returned', () => {
    const messages = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }, { id: 6 }];
    const flags = {};
    const expectedUnread = [];

    const actualUnread = filterUnreadMessagesInRange(messages, flags, 5, 1);

    expect(actualUnread).toEqual(expectedUnread);
  });

  test('messages in outbox are filtered out', () => {
    const messages = [{ id: 1 }, { id: 2 }, { id: 34567, isOutbox: true }];
    const flags = {};
    const expectedUnread = [1, 2];

    const actualUnread = filterUnreadMessagesInRange(messages, flags, 1, Number.MAX_SAFE_INTEGER);

    expect(actualUnread).toEqual(expectedUnread);
  });

  test('messages are not read if not in flags object, regardless of message property', () => {
    const messages = [{ id: 1 }];
    const flags = {};
    const expectedUnread = [1];

    const actualUnread = filterUnreadMessagesInRange(messages, flags, 1, 5);

    expect(actualUnread).toEqual(expectedUnread);
  });
});
