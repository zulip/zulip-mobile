import { getNarrowFromNotificationData, extractNotificationData } from '..';
import { topicNarrow, privateNarrow, groupNarrow } from '../../utils/narrow';

describe('getNarrowFromNotificationData', () => {
  test('unknown notification data returns null', () => {
    const notification = {};
    const narrow = getNarrowFromNotificationData(notification, {});
    expect(narrow).toBe(null);
  });

  test('recognizes stream notifications and returns topic narrow', () => {
    const notification = {
      recipient_type: 'stream',
      stream: 'some stream',
      topic: 'some topic',
    };
    const narrow = getNarrowFromNotificationData(notification, {});
    expect(narrow).toEqual(topicNarrow('some stream', 'some topic'));
  });

  test('on notification for a private message returns a PM narrow', () => {
    const notification = {
      recipient_type: 'private',
      sender_email: 'mark@example.com',
    };
    const narrow = getNarrowFromNotificationData(notification, {});
    expect(narrow).toEqual(privateNarrow('mark@example.com'));
  });

  test('on notification for a group message returns a group narrow', () => {
    const notification = {
      recipient_type: 'private',
      pm_users: '1,2,4',
    };
    const usersById = new Map([
      [1, { email: 'me@example.com' }],
      [2, { email: 'mark@example.com' }],
      [4, { email: 'john@example.com' }],
    ]);
    const expectedNarrow = groupNarrow(['me@example.com', 'mark@example.com', 'john@example.com']);

    const narrow = getNarrowFromNotificationData(notification, usersById);

    expect(narrow).toEqual(expectedNarrow);
  });

  test('do not throw when users are not found; return null', () => {
    const notification = {
      recipient_type: 'private',
      pm_users: '1,2,4',
    };
    const usersById = new Map();

    const narrow = getNarrowFromNotificationData(notification, usersById);

    expect(narrow).toBe(null);
  });
});

describe('extractNotificationData', () => {
  test('if input value is not as expected, returns null', () => {
    expect(extractNotificationData()).toBe(null);
    expect(extractNotificationData({})).toBe(null);
    expect(extractNotificationData({ getData: undefined })).toBe(null);
  });

  test('if some data is passed, returns it', () => {
    const data = {};
    expect(extractNotificationData({ getData: () => data })).toBe(data);
    expect(extractNotificationData({ getData: () => ({ zulip: data }) })).toBe(data);
  });
});
