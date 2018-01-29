/* @flow */
import type { Actions } from '../types';
import { topicNarrow, privateNarrow } from '../utils/narrow';

export const handleNotification = (
  data: Object,
  doNarrow: Actions.doNarrow,
  anchor: number,
): void => {
  if (data && data.recipient_type) {
    if (data.recipient_type === 'stream') {
      setTimeout(() => doNarrow(topicNarrow(data.stream, data.topic), anchor), 100);
    } else if (data.recipient_type === 'private') {
      setTimeout(() => doNarrow(privateNarrow(data.sender_email), anchor), 100);
    }
  }
};
