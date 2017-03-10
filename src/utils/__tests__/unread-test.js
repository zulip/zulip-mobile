import { getUnreadMessageCount } from '../unread';

describe('getUnreadMessageCount', () => {
  test('empty message list has no unread messages', () => {
    expect(getUnreadMessageCount([])).toBe(0);
  });

  test('messages with no flags property or one with no "read" value are not read', () => {
    expect(getUnreadMessageCount([
      {},
      { flags: [] },
    ])).toBe(2);
  });

  test('messages with "read" in their flags array are read', () => {
    expect(getUnreadMessageCount([
      { flags: ['read'] },
      {},
      { flags: ['read'] },
    ])).toBe(1);
  });
});
