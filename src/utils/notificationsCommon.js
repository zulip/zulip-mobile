/* @flow */
import type { Actions } from '../types';
import config from '../config';
import { topicNarrow, privateNarrow } from '../utils/narrow';

export const handleNotification = (
  data: Object,
  doNarrow: Actions.doNarrow,
  anchor: number,
): void => {
  if (!data || !data.recipient_type) return;

  if (data.recipient_type === 'stream') {
    config.startup.narrow = topicNarrow(data.stream, data.topic);
  } else if (data.recipient_type === 'private') {
    config.startup.narrow = privateNarrow(data.sender_email);
  }
  config.startup.anchor = anchor;
};
