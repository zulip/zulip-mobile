import { countUnread, filterUnreadMessageIds } from '../unread';

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

describe('countUnread', () => {
  test('for an empty message list the unread count is zero', () => {
    const messages = [];
    const flags = {};

    const actualCount = countUnread(messages, flags);

    expect(actualCount).toEqual(0);
  });

  test('when no read flags are set, every message is unread', () => {
    const messages = [1, 2, 3];
    const flags = {};

    const actualCount = countUnread(messages, flags);

    expect(actualCount).toEqual(3);
  });

  test('every message present in read flags is not counted', () => {
    const messages = [1, 2, 3];
    const flags = {
      1: true,
      2: true,
    };

    const actualCount = countUnread(messages, flags);

    expect(actualCount).toEqual(1);
  });

  test('counts all unread from specified message id to the end', () => {
    const messages = [1, 2, 3, 4, 5];
    const flags = {};

    const actualCount = countUnread(messages, flags, 3);

    expect(actualCount).toEqual(3);
  });

  test('counts all unread from beginning to given message id', () => {
    const messages = [1, 2, 3, 4, 5];
    const flags = {};

    const actualCount = countUnread(messages, flags, -1, 4);

    expect(actualCount).toEqual(4);
  });

  test('counts all unread from given message id to another id', () => {
    const messages = [1, 2, 3, 4, 5, 6, 7, 8];
    const flags = {};

    const actualCount = countUnread(messages, flags, 3, 6);

    expect(actualCount).toEqual(4);
  });
});
