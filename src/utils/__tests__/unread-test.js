import { filterUnreadMessages } from '../unread';

describe('filterUnreadMessages', () => {
  test('empty message list has no unread messages', () => {
    const messages = [];
    const flags = {};
    const expectedUnread = [];

    const actualUnread = filterUnreadMessages(messages, flags);

    expect(actualUnread).toEqual(expectedUnread);
  });

  test('messages with no flags or empty flag array are not read', () => {
    const messages = [
      { id: 1 },
      { id: 2 },
      { id: 3 },
    ];
    const flags = {
      2: [],
      3: ['read'],
    };
    const expectedUnread = [
      { id: 1 },
      { id: 2 },
    ];

    const actualUnread = filterUnreadMessages(messages, flags);

    expect(actualUnread).toEqual(expectedUnread);
  });

  test('messages are not read if not in flags object, regardless of message property', () => {
    const messages = [
      { id: 1, flags: ['read'] },
    ];
    const flags = {};
    const expectedUnread = [
      { id: 1, flags: ['read'] },
    ];

    const actualUnread = filterUnreadMessages(messages, flags);

    expect(actualUnread).toEqual(expectedUnread);
  });
});
