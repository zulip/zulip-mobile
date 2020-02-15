// @flow strict-local
import { getNarrowFromNotificationData, extractNotificationData } from '..';
import { topicNarrow, privateNarrow, groupNarrow } from '../../utils/narrow';

import type { User } from '../../api/modelTypes';
import * as eg from '../../__tests__/exampleData';

describe('getNarrowFromNotificationData', () => {
  const DEFAULT_MAP = new Map<number, User>();

  test('unknown notification data returns null', () => {
    // $FlowFixMe: actually validate APNs messages
    const notification: Notification = {};
    const narrow = getNarrowFromNotificationData(notification, DEFAULT_MAP);
    expect(narrow).toBe(null);
  });

  test('recognizes stream notifications and returns topic narrow', () => {
    const notification = {
      recipient_type: 'stream',
      stream: 'some stream',
      topic: 'some topic',
    };
    const narrow = getNarrowFromNotificationData(notification, DEFAULT_MAP);
    expect(narrow).toEqual(topicNarrow('some stream', 'some topic'));
  });

  test('on notification for a private message returns a PM narrow', () => {
    const notification = {
      recipient_type: 'private',
      sender_email: 'mark@example.com',
    };
    const narrow = getNarrowFromNotificationData(notification, DEFAULT_MAP);
    expect(narrow).toEqual(privateNarrow('mark@example.com'));
  });

  test('on notification for a group message returns a group narrow', () => {
    const users = [eg.makeUser(), eg.makeUser(), eg.makeUser(), eg.makeUser()];
    const usersById: Map<number, User> = new Map(users.map(u => [u.user_id, u]));

    const notification = {
      recipient_type: 'private',
      pm_users: users.map(u => u.user_id).join(','),
    };

    const expectedNarrow = groupNarrow(users.map(u => u.email));

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
    // $FlowFixMe
    expect(extractNotificationData({})).toBe(null);
    // $FlowFixMe
    expect(extractNotificationData({ getData: undefined })).toBe(null);
  });

  test('if some data is passed, returns it', () => {
    const data = {};
    // $FlowFixMe
    expect(extractNotificationData({ getData: () => data })).toBe(data);
    // $FlowFixMe
    expect(extractNotificationData({ getData: () => ({ zulip: data }) })).toBe(data);
  });
});
