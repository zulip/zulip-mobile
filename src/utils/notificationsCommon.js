/* @flow */
import type { Actions } from '../types';
import { topicNarrow, privateNarrow } from '../utils/narrow';

export const handleNotification = (data: Object, doNarrow: Actions.doNarrow): void => {
  if (data && data.recipient_type) {
    if (data.recipient_type === 'stream') {
      doNarrow(topicNarrow(data.stream, data.topic));
    } else if (data.recipient_type === 'private') {
      doNarrow(privateNarrow(data.sender_email));
    }
  }
};
