/* @flow */
import type { Notification, NotificationGroup, UserIdMap } from '../types';
import { homeNarrow, topicNarrow, privateNarrow, groupNarrow } from '../utils/narrow';

const getGroupNarrowFromNotificationData = (data: NotificationGroup, usersById: UserIdMap = {}) => {
  const userIds = data.pm_users.split(',');
  const userEmails = userIds.map(x => usersById[x].email);
  return groupNarrow(userEmails);
};

export const getNarrowFromNotificationData = (data: Notification, usersById: UserIdMap = {}) => {
  if (!data || !data.recipient_type) {
    return homeNarrow;
  }

  if (data.recipient_type === 'stream') {
    return topicNarrow(data.stream, data.topic);
  }

  // $FlowFixMe
  if (!data.pm_users) {
    return privateNarrow(data.sender_email);
  }

  return getGroupNarrowFromNotificationData(data, usersById);
};
