import { getNarrowFromNotificationData } from '../notificationsCommon';
import { homeNarrow, topicNarrow, privateNarrow } from '../narrow';

describe('getNarrowFromNotificationData', () => {
  test('unknown notification data returns home narrow', () => {
    const notification = {};
    const narrow = getNarrowFromNotificationData(notification);
    expect(narrow).toEqual(homeNarrow);
  });

  test('recognizes stream notifications and returns topic narrow', () => {
    const notification = {
      recipient_type: 'stream',
      stream: 'some stream',
      topic: 'some topic',
    };
    const narrow = getNarrowFromNotificationData(notification);
    expect(narrow).toEqual(topicNarrow('some stream', 'some topic'));
  });

  test('on notification for a private message returns a PM narrow', () => {
    const notification = {
      recipient_type: 'private',
      sender_email: 'mark@example.com',
    };
    const narrow = getNarrowFromNotificationData(notification);
    expect(narrow).toEqual(privateNarrow('mark@example.com'));
  });
});
