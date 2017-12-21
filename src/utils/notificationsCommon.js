/* @flow */
import type { Action, Narrow } from '../types';
import { topicNarrow, privateNarrow } from '../utils/narrow';

export const handleNotification = (data: Object, doNarrow: (newNarrow: Narrow) => Action) => {
  if (data && data.recipient_type) {
    if (data.recipient_type === 'stream') {
      doNarrow(topicNarrow(data.stream, data.topic));
    } else if (data.recipient_type === 'private') {
      doNarrow(privateNarrow(data.sender_email));
    }
  }
};
