import { filterUnreadMessageIds } from '../unread';

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
      }
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
