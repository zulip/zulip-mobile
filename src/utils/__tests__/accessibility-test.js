import { textWithUnreadCount } from '../accessibility';

describe('textWithUnreadCount', () => {
  test('returns just "text" if no unread count provided', () => {
    expect(textWithUnreadCount('some text')).toEqual('some text');
    expect(textWithUnreadCount('some text', 0)).toEqual('some text');
  });

  test('appends properly pluralized unread text', () => {
    expect(textWithUnreadCount('some text', 1)).toEqual('some text, 1 unread message');
    expect(textWithUnreadCount('some text', 5)).toEqual('some text, 5 unread messages');
  });
});
