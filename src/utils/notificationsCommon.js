/* @flow */
import { homeNarrow, topicNarrow, privateNarrow } from '../utils/narrow';
import type { Notification } from '../types';

export const getNarrowFromNotificationData = (data: Notification) =>
  !data || !data.recipient_type
    ? homeNarrow
    : data.recipient_type === 'stream'
      ? topicNarrow(data.stream, data.topic)
      : privateNarrow(data.sender_email);
